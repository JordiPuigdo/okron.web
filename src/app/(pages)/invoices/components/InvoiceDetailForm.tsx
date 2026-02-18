'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { DeliveryNote, TaxBreakdown } from 'app/interfaces/DeliveryNote';
import { WorkOrder } from 'app/interfaces/workOrder';
import { formatEuropeanCurrency } from 'app/utils/utils';
import ChooseElement from 'components/ChooseElement';
import { CustomerInformationComponent } from 'components/customer/CustomerInformationComponent';
import { InstallationComponent } from 'components/customer/InstallationComponent';
import { TotalComponent } from 'components/customer/TotalComponent';
import { Input } from 'components/ui/input';
import dayjs from 'dayjs';
import { Eye, Plus, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { HeaderForm } from '../../../../components/layout/HeaderForm';
import { Button } from '../../../../designSystem/Button/Buttons';
import { SvgSpinner } from '../../../icons/icons';
import {
  Invoice,
  InvoiceStatus,
  InvoiceUpdateRequest,
} from '../../../interfaces/Invoice';
import { DeliveryNoteService } from '../../../services/deliveryNoteService';
import useRoutes from '../../../utils/useRoutes';
import { DeliveryNotePreviewPanel } from '../../deliveryNotes/components/DeliveryNotePreviewPanel';
import { WorkOrderPreviewPanel } from '../../workOrders/components/WorkOrderPreviewPanel';

interface InvoiceDetailFormProps {
  invoice: Invoice;
  onUpdate: (invoice: InvoiceUpdateRequest) => Promise<void>;
}

export function InvoiceDetailForm({
  invoice,
  onUpdate,
}: InvoiceDetailFormProps) {
  const router = useRouter();
  const ROUTES = useRoutes();

  const [formData, setFormData] = useState<Invoice>(invoice);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { t } = useTranslations();

  const [showAddDeliveryNote, setShowAddDeliveryNote] = useState(false);
  const [availableDeliveryNotes, setAvailableDeliveryNotes] = useState<
    DeliveryNote[]
  >([]);
  const [isLoadingDeliveryNotes, setIsLoadingDeliveryNotes] = useState(false);

  const [previewDeliveryNote, setPreviewDeliveryNote] =
    useState<DeliveryNote | null>(null);
  const [isDeliveryNotePreviewOpen, setIsDeliveryNotePreviewOpen] =
    useState(false);
  const [previewWorkOrder, setPreviewWorkOrder] =
    useState<WorkOrder | null>(null);
  const [isWorkOrderPreviewOpen, setIsWorkOrderPreviewOpen] = useState(false);

  const deliveryNoteService = useMemo(
    () =>
      new DeliveryNoteService(process.env.NEXT_PUBLIC_API_BASE_URL || ''),
    []
  );

  const customerId = useMemo(
    () => formData.deliveryNotes?.[0]?.customerId,
    [formData.deliveryNotes]
  );

  const companyName = useMemo(
    () => formData.deliveryNotes?.[0]?.companyName,
    [formData.deliveryNotes]
  );

  useEffect(() => {
    setFormData(invoice);
  }, [invoice]);

  const fetchAvailableDeliveryNotes = useCallback(async () => {
    if (!customerId && !companyName) return;
    setIsLoadingDeliveryNotes(true);
    try {
      const deliveryNotes = await deliveryNoteService.searchDeliveryNotes({
        customerId: customerId,
        companyName: companyName,
        hasInvoice: false,
      });
      setAvailableDeliveryNotes(deliveryNotes.filter(dn => dn.active));
    } catch (error) {
      console.error('Error fetching delivery notes:', error);
      setAvailableDeliveryNotes([]);
    } finally {
      setIsLoadingDeliveryNotes(false);
    }
  }, [customerId, companyName, deliveryNoteService]);

  const handleToggleAddDeliveryNote = () => {
    const nextState = !showAddDeliveryNote;
    setShowAddDeliveryNote(nextState);
    if (nextState) {
      fetchAvailableDeliveryNotes();
    }
  };

  const handleDeliveryNoteSelected = async (deliveryNoteId: string) => {
    try {
      const deliveryNote =
        await deliveryNoteService.getById(deliveryNoteId);
      if (deliveryNote) {
        setFormData(prev => ({
          ...prev,
          deliveryNotes: [...(prev.deliveryNotes || []), deliveryNote],
          deliveryNoteIds: [
            ...(prev.deliveryNoteIds || []),
            deliveryNoteId,
          ],
        }));
      }
    } catch (error) {
      console.error('Error fetching delivery note:', error);
    }
  };

  const handleDeleteAddedDeliveryNote = (deliveryNoteId: string) => {
    setFormData(prev => ({
      ...prev,
      deliveryNotes: (prev.deliveryNotes || []).filter(
        dn => dn.id !== deliveryNoteId
      ),
      deliveryNoteIds: (prev.deliveryNoteIds || []).filter(
        id => id !== deliveryNoteId
      ),
    }));
  };

  const addedDeliveryNoteIds = useMemo(() => {
    const originalIds = new Set(
      invoice.deliveryNoteIds || invoice.deliveryNotes?.map(dn => dn.id) || []
    );
    return (
      formData.deliveryNoteIds?.filter(id => !originalIds.has(id)) || []
    );
  }, [formData.deliveryNoteIds, invoice.deliveryNoteIds, invoice.deliveryNotes]);

  const handlePreviewDeliveryNote = (dn: DeliveryNote) => {
    setPreviewDeliveryNote(dn);
    setIsDeliveryNotePreviewOpen(true);
  };

  const handlePreviewWorkOrder = (workOrderId: string) => {
    setPreviewWorkOrder({ id: workOrderId } as WorkOrder);
    setIsWorkOrderPreviewOpen(true);
  };

  const translateInvoiceStatus = (status: InvoiceStatus): string => {
    switch (status) {
      case InvoiceStatus.Pending:
        return 'Pendent';
      case InvoiceStatus.Invoiced:
        return 'Facturada';
      default:
        return 'Desconegut';
    }
  };

  // Totals based on all delivery notes and their work orders items
  const { subtotal, totalTax, total, taxBreakdowns } = useMemo(() => {
    if (!formData.deliveryNotes) return {};

    // Agrupar taxBreakdowns de todos los delivery notes por porcentaje
    const taxBreakdownsMap = new Map<number, TaxBreakdown>();

    formData.deliveryNotes.forEach(dn => {
      if (dn.taxBreakdowns && dn.taxBreakdowns.length > 0) {
        dn.taxBreakdowns.forEach(breakdown => {
          const existing = taxBreakdownsMap.get(breakdown.taxPercentage);
          if (existing) {
            existing.taxableBase += breakdown.taxableBase;
            existing.taxAmount += breakdown.taxAmount;
          } else {
            taxBreakdownsMap.set(breakdown.taxPercentage, {
              taxPercentage: breakdown.taxPercentage,
              taxableBase: breakdown.taxableBase,
              taxAmount: breakdown.taxAmount,
            });
          }
        });
      }
    });

    const aggregatedTaxBreakdowns = Array.from(taxBreakdownsMap.values()).sort(
      (a, b) => a.taxPercentage - b.taxPercentage
    );

    // Calcular totales desde los taxBreakdowns si existen
    if (aggregatedTaxBreakdowns.length > 0) {
      const subtotalCalc = aggregatedTaxBreakdowns.reduce(
        (sum, tb) => sum + tb.taxableBase,
        0
      );
      const taxCalc = aggregatedTaxBreakdowns.reduce(
        (sum, tb) => sum + tb.taxAmount,
        0
      );
      return {
        subtotal: subtotalCalc,
        totalTax: taxCalc,
        total: subtotalCalc + taxCalc,
        taxBreakdowns: aggregatedTaxBreakdowns,
      };
    }

    // Fallback al cálculo antiguo si no hay taxBreakdowns
    const subtotalCalc = formData.deliveryNotes.reduce((sumDN, dn) => {
      const dnSum = dn.workOrders.reduce((sumWO, wo) => {
        const woSum = wo.items.reduce(
          (sumItem, item) => sumItem + item.lineTotal,
          0
        );
        return sumWO + woSum;
      }, 0);
      return sumDN + dnSum;
    }, 0);

    const tax = subtotalCalc * 0.21; // 21% IVA
    return {
      subtotal: subtotalCalc,
      totalTax: tax,
      total: subtotalCalc + tax,
      taxBreakdowns: undefined,
    };
  }, [formData.deliveryNotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      const updateRequest: InvoiceUpdateRequest = {
        id: formData.id,
        code: formData.code,
        status: formData.status,
        deliveryNoteIds: formData.deliveryNotes?.map(dn => dn.id) || [],
      };

      await onUpdate(updateRequest);

      setTimeout(() => {
        setIsLoading(false);
        router.push(ROUTES.invoices.list);
      }, 500);
    } catch (error) {
      console.error('Error updating invoice:', error);
      setIsLoading(false);
    }
  };

  if (!formData.deliveryNotes) return null;
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <HeaderForm
          header={formData.code}
          isCreate={false}
          canPrint={`invoice?id=${formData.id}`}
        />

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="font-semibold">Codi</label>
                <Input
                  value={formData.code}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, code: e.target.value }))
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="font-semibold">Estat</label>
                <select
                  value={formData.status}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      status: Number(e.target.value) as InvoiceStatus,
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                >
                  {Object.values(InvoiceStatus)
                    .filter(value => typeof value === 'number')
                    .map(status => (
                      <option key={status} value={status}>
                        {translateInvoiceStatus(status as InvoiceStatus)}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-semibold">Data Venciment</label>
                <div className="p-2 bg-gray-50 rounded border text-gray-700">
                  {dayjs(formData.dueDate).format('DD/MM/YYYY')}
                </div>
              </div>
            </div>
            {formData.deliveryNotes && formData.deliveryNotes.length >= 0 && (
              <div className="flex gap-2 justify-between">
                <CustomerInformationComponent
                  companyName={formData.deliveryNotes[0].companyName ?? ''}
                  customerAddress={formData.deliveryNotes[0].customerAddress}
                />
                {formData.deliveryNotes[0].installation && (
                  <InstallationComponent
                    installation={formData.deliveryNotes[0].installation!}
                  />
                )}
              </div>
            )}

            {/* Delivery Notes */}
            {formData.deliveryNotes.map((dn, dnIndex) => (
              <div key={dn.id} className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePreviewDeliveryNote(dn)}
                      className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#6E41B6] hover:bg-[#5a3596] transition-colors"
                      title={t('preview')}
                    >
                      <Eye className="w-4 h-4 text-white" />
                    </button>
                    <h3 className="font-semibold">{dn.code}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>
                      Data: {new Date(dn.deliveryNoteDate).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddedDeliveryNote(dn.id)}
                      className="bg-okron-btDelete hover:bg-okron-btDeleteHover text-white rounded-xl py-1 px-3 text-sm flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                      {t('delete')}
                    </button>
                  </div>
                </div>

                {/* Items */}
                {dn.workOrders.map((wo, woIndex) => (
                  <div key={wo.workOrderId} className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        type="button"
                        onClick={() => handlePreviewWorkOrder(wo.workOrderId)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#6E41B6] hover:bg-[#5a3596] transition-colors"
                        title={t('preview')}
                      >
                        <Eye className="w-4 h-4 text-white" />
                      </button>
                      <h4 className="font-semibold">
                        {wo.workOrderCode} - {wo.workOrderRefId}
                      </h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 border text-left">Descripció</th>
                            <th className="p-2 border text-center">
                              Quantitat
                            </th>
                            <th className="p-2 border text-center">
                              Preu Unitari
                            </th>
                            <th className="p-2 border text-center">% Dte.</th>
                            <th className="p-2 border text-center">
                              Import Dte.
                            </th>
                            <th className="p-2 border text-center">
                              Total Línia
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {wo.items.map((item, itemIndex) => (
                            <tr key={itemIndex} className="border-t">
                              <td className="p-2 border">{item.description}</td>
                              <td className="p-2 border text-center">
                                {item.quantity}
                              </td>
                              <td className="p-2 border text-center">
                                {formatEuropeanCurrency(item.unitPrice, t)}
                              </td>
                              <td className="p-2 border text-center">
                                {item.discountPercentage.toFixed(2)}%
                              </td>
                              <td className="p-2 border text-center">
                                {formatEuropeanCurrency(item.discountAmount, t)}
                              </td>
                              <td className="p-2 border text-center">
                                {formatEuropeanCurrency(item.lineTotal, t)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Add Delivery Notes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">
                  {t('addDeliveryNotes')}
                </h3>
                <Button
                  type="create"
                  onClick={handleToggleAddDeliveryNote}
                  customStyles="flex items-center gap-2"
                >
                  {showAddDeliveryNote ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <p>
                    {showAddDeliveryNote
                      ? t('close')
                      : t('addDeliveryNotes')}
                  </p>
                </Button>
              </div>

              {showAddDeliveryNote && (
                <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                  {isLoadingDeliveryNotes ? (
                    <div className="flex justify-center py-4">
                      <SvgSpinner className="h-6 w-6" />
                    </div>
                  ) : availableDeliveryNotes.length > 0 ? (
                    <ChooseElement
                      elements={availableDeliveryNotes}
                      selectedElements={addedDeliveryNoteIds}
                      onElementSelected={handleDeliveryNoteSelected}
                      onDeleteElementSelected={handleDeleteAddedDeliveryNote}
                      placeholder={t('searchDeliveryNote')}
                      mapElement={deliveryNote => ({
                        id: deliveryNote.id,
                        description: `${deliveryNote.code} - ${new Date(
                          deliveryNote.deliveryNoteDate
                        ).toLocaleDateString()} - ${deliveryNote.workOrders
                          .map(x => x.workOrderRefId)
                          .join(', ')} - ${deliveryNote.workOrders
                          .map(x => x.workOrderCode)
                          .join(', ')} - ${formatEuropeanCurrency(
                          deliveryNote.subtotal,
                          t
                        )}`,
                      })}
                    />
                  ) : (
                    <p className="text-gray-500 text-sm">
                      {t('noDeliveryNotesAvailable')}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Totals */}
            <TotalComponent
              subtotal={subtotal || 0}
              totalTax={totalTax || 0}
              total={total || 0}
              taxBreakdowns={taxBreakdowns}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="create"
                isSubmit
                className="flex-1"
                customStyles="flex justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <SvgSpinner className="mr-2 h-4 w-4" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                <p>Actualitzar</p>
              </Button>
              <Button
                type="cancel"
                variant="outline"
                onClick={() => router.push(ROUTES.invoices.list)}
                className="flex-1"
                customStyles="flex justify-center"
                disabled={isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                <p>Cancelar</p>
              </Button>
            </div>
          </form>
        </div>
      </div>

      <DeliveryNotePreviewPanel
        deliveryNote={previewDeliveryNote}
        isOpen={isDeliveryNotePreviewOpen}
        onClose={() => setIsDeliveryNotePreviewOpen(false)}
        hideInvoiceActions
      />

      <WorkOrderPreviewPanel
        workOrder={previewWorkOrder}
        isOpen={isWorkOrderPreviewOpen}
        onClose={() => setIsWorkOrderPreviewOpen(false)}
      />
    </div>
  );
}
