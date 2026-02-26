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
import { Button } from 'designSystem/Button/Buttons';
import { ArrowLeft, FileText, Pencil, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { CreditNoteInfoCard } from './CreditNoteInfoCard';
import { CreditNoteItemsTable } from './CreditNoteItemsTable';
import { CreditNoteTotalsCard } from './CreditNoteTotalsCard';

interface CreditNoteDetailFormProps {
  creditNote: CreditNote;
  onUpdate: (request: CreditNoteUpdateRequest) => Promise<void>;
}

const CREDIT_NOTE_TYPE_LABELS: Record<CreditNoteType, string> = {
  [CreditNoteType.Total]: 'Total',
  [CreditNoteType.Partial]: 'Parcial',
  [CreditNoteType.External]: 'Externa',
};

const CREDIT_NOTE_TYPE_STYLES: Record<CreditNoteType, string> = {
  [CreditNoteType.Total]: 'bg-blue-100 text-blue-700',
  [CreditNoteType.Partial]: 'bg-amber-100 text-amber-700',
  [CreditNoteType.External]: 'bg-purple-100 text-purple-700',
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

  const typeLabel = CREDIT_NOTE_TYPE_LABELS[creditNote.type] ?? t('common.unknown');
  const typeStyle = CREDIT_NOTE_TYPE_STYLES[creditNote.type] ?? 'bg-gray-100 text-gray-700';

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

  const handleSubmit = async () => {
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

  return (
    <div className="min-h-screen bg-gray-50/80">
      <div className="px-4 py-6 space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.push(ROUTES.invoices.list + '?tab=creditNotes')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-okron-primary/10">
                  <FileText className="w-5 h-5 text-okron-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {creditNote.code}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {t('creditNote.detail')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${typeStyle}`}
              >
                {typeLabel}
              </span>
              {!isEditing && (
                <Button
                  type="edit"
                  onClick={handleStartEdit}
                  customStyles="flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  <p>{t('edit')}</p>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-6">
            <CreditNoteItemsTable
              items={isEditing ? editedItems : creditNote.items || []}
              isEditing={isEditing}
              onItemChange={handleItemChange}
              t={t}
            />

            {creditNote.reason && !isEditing && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {t('creditNote.reason')}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {creditNote.reason}
                </p>
              </div>
            )}

            {isEditing && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {t('creditNote.reason')}
                </h3>
                <textarea
                  value={editedReason}
                  onChange={e => setEditedReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-okron-primary focus:ring-1 focus:ring-okron-primary outline-none transition-colors resize-none"
                  placeholder={t('creditNote.reason.placeholder')}
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <CreditNoteInfoCard creditNote={creditNote} t={t} />
            <CreditNoteTotalsCard
              subtotal={isEditing ? totals.subtotal : creditNote.subtotal}
              taxAmount={isEditing ? totals.taxAmount : creditNote.taxAmount}
              total={isEditing ? totals.total : creditNote.total}
              creditPercentage={creditNote.creditPercentage}
              t={t}
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="cancel"
              onClick={handleCancelEdit}
              customStyles="flex items-center gap-2"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4" />
              <p>{t('cancel')}</p>
            </Button>
            <Button
              type="create"
              onClick={handleSubmit}
              customStyles="flex items-center gap-2"
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4" />
              <p>{t('save')}</p>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
