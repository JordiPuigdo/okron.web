'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import {
  CreditNote,
  CreditNoteItem,
  CreditNoteType,
  CreditNoteUpdateRequest,
} from 'app/interfaces/CreditNote';
import useRoutes from 'app/utils/useRoutes';
import { TotalComponent } from 'components/customer/TotalComponent';
import { Textarea } from 'components/textarea';
import dayjs from 'dayjs';
import { Button } from 'designSystem/Button/Buttons';
import { Pencil, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { HeaderForm } from '../../../../../components/layout/HeaderForm';
import { SvgSpinner } from '../../../../icons/icons';
import { CreditNoteItemsTable } from './CreditNoteItemsTable';

interface CreditNoteDetailFormProps {
  creditNote: CreditNote;
  onUpdate: (request: CreditNoteUpdateRequest) => Promise<void>;
}

const CREDIT_NOTE_TYPE_LABELS: Record<CreditNoteType, string> = {
  [CreditNoteType.Total]: 'Total',
  [CreditNoteType.Partial]: 'Parcial',
  [CreditNoteType.External]: 'Externa',
};

export function CreditNoteDetailForm({
  creditNote,
  onUpdate,
}: CreditNoteDetailFormProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const ROUTES = useRoutes();

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedReason, setEditedReason] = useState(creditNote.reason || '');
  const [editedItems, setEditedItems] = useState<CreditNoteItem[]>(
    creditNote.items || []
  );

  const typeLabel =
    CREDIT_NOTE_TYPE_LABELS[creditNote.type] ?? t('common.unknown');

  const totals = useMemo(() => {
    const items = isEditing ? editedItems : creditNote.items || [];
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const taxAmount = items.reduce(
      (sum, item) => sum + (item.total - item.subtotal),
      0
    );
    const total = items.reduce((sum, item) => sum + item.total, 0);
    return { subtotal, taxAmount, total };
  }, [creditNote.items, editedItems, isEditing]);

  const handleStartEdit = () => {
    setEditedReason(creditNote.reason || '');
    setEditedItems(creditNote.items || []);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedReason(creditNote.reason || '');
    setEditedItems(creditNote.items || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const updateRequest: CreditNoteUpdateRequest = {
        id: creditNote.id,
        reason: editedReason,
        items: editedItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercentage: item.discountPercentage,
          discountAmount: item.discountAmount,
          taxPercentage: item.taxPercentage,
        })),
      };

      await onUpdate(updateRequest);
      setIsEditing(false);
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof CreditNoteItem,
    value: number | string
  ) => {
    setEditedItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      const baseAmount = item.quantity * item.unitPrice;
      const discountAmount =
        item.discountPercentage > 0
          ? baseAmount * (item.discountPercentage / 100)
          : item.discountAmount;
      const subtotal = baseAmount - discountAmount;
      const taxAmount = subtotal * (item.taxPercentage / 100);

      item.discountAmount = discountAmount;
      item.subtotal = subtotal;
      item.total = subtotal + taxAmount;

      updated[index] = item;
      return updated;
    });
  };

  const invoiceReference =
    creditNote.originalInvoiceCode ||
    creditNote.externalInvoiceCode ||
    t('common.not.available');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <HeaderForm
          header={creditNote.code}
          isCreate={false}
          canPrint={`creditNote?id=${creditNote.id}`}
        />

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="font-semibold">{t('creditNotes.columns.code')}</label>
                <div className="p-2 bg-gray-50 rounded border text-gray-700">
                  {creditNote.code}
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold">{t('creditNotes.columns.date')}</label>
                <div className="p-2 bg-gray-50 rounded border text-gray-700">
                  {dayjs(creditNote.creditNoteDate).format('DD/MM/YYYY')}
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold">{t('creditNotes.columns.type')}</label>
                <div className="p-2 bg-gray-50 rounded border text-gray-700">
                  {typeLabel}
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold">
                  {t('creditNotes.originalInvoice')}
                </label>
                <div className="p-2 bg-gray-50 rounded border text-gray-700">
                  {invoiceReference}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="font-semibold">
                  {t('creditNotes.columns.customer')}
                </label>
                <div className="p-2 bg-gray-50 rounded border text-gray-700">
                  {creditNote.companyName || t('common.not.available')}
                </div>
              </div>

              {creditNote.creditPercentage !== undefined &&
                creditNote.creditPercentage !== null && (
                  <div className="space-y-2">
                    <label className="font-semibold">
                      {t('creditNotes.percentageToCredit')}
                    </label>
                    <div className="p-2 bg-gray-50 rounded border text-gray-700">
                      {creditNote.creditPercentage}%
                    </div>
                  </div>
                )}
            </div>

            {!isEditing && (
              <div className="flex justify-end">
                <Button
                  type="edit"
                  onClick={handleStartEdit}
                  customStyles="flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  <p>{t('edit')}</p>
                </Button>
              </div>
            )}

            <CreditNoteItemsTable
              items={isEditing ? editedItems : creditNote.items || []}
              isEditing={isEditing}
              onItemChange={handleItemChange}
              t={t}
            />

            <TotalComponent
              subtotal={isEditing ? totals.subtotal : creditNote.subtotal}
              totalTax={isEditing ? totals.taxAmount : creditNote.taxAmount}
              total={isEditing ? totals.total : creditNote.total}
            />

            <div className="space-y-2">
              <label className="font-semibold">
                {t('creditNotes.reason')}
              </label>
              {isEditing ? (
                <Textarea
                  placeholder={t('creditNotes.reasonPlaceholder')}
                  value={editedReason}
                  onChange={e => setEditedReason(e.target.value)}
                  className="min-h-[100px]"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded border text-gray-700 min-h-[60px]">
                  {creditNote.reason || '-'}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-6 border-t">
              {isEditing ? (
                <>
                  <Button
                    type="create"
                    isSubmit
                    className="flex-1"
                    customStyles="flex justify-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <SvgSpinner className="mr-2 h-4 w-4" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    <p>{t('save')}</p>
                  </Button>
                  <Button
                    type="cancel"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex-1"
                    customStyles="flex justify-center"
                    disabled={isSubmitting}
                  >
                    <X className="mr-2 h-4 w-4" />
                    <p>{t('cancel')}</p>
                  </Button>
                </>
              ) : (
                <Button
                  type="cancel"
                  variant="outline"
                  onClick={() =>
                    router.push(ROUTES.invoices.list + '?tab=creditNotes')
                  }
                  className="flex-1"
                  customStyles="flex justify-center"
                >
                  <X className="mr-2 h-4 w-4" />
                  <p>{t('common.cancel')}</p>
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
