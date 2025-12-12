'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useTranslations } from 'app/hooks/useTranslations';
import { translateDeliveryNoteStatus } from 'app/utils/deliveryNoteUtils';
import { formatEuropeanCurrency } from 'app/utils/utils';
import { CustomerInformationComponent } from 'components/customer/CustomerInformationComponent';
import { InstallationComponent } from 'components/customer/InstallationComponent';
import { TotalComponent } from 'components/customer/TotalComponent';
import { ca } from 'date-fns/locale';
import dayjs from 'dayjs';
import { Plus, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { HeaderForm } from '../../../../components/layout/HeaderForm';
import { Textarea } from '../../../../components/textarea';
import { Button } from '../../../../designSystem/Button/Buttons';
import { SvgSpinner } from '../../../icons/icons';
import {
  DeliveryNote,
  DeliveryNoteItem,
  DeliveryNoteItemType,
  DeliveryNoteStatus,
  DeliveryNoteUpdateRequest,
  DeliveryNoteWorkOrder,
} from '../../../interfaces';
import { cn } from '../../../lib/utils';
import useRoutes from '../../../utils/useRoutes';
import { EditableCell } from '../../machines/downtimes/components/EditingCell';

interface DeliveryNoteDetailFormProps {
  deliveryNote: DeliveryNote;
  onUpdate: (deliveryNote: DeliveryNoteUpdateRequest) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function DeliveryNoteDetailForm({
  deliveryNote,
  onUpdate,
  onDelete,
}: DeliveryNoteDetailFormProps) {
  const router = useRouter();
  const ROUTES = useRoutes();

  const [formData, setFormData] = useState<DeliveryNote>(deliveryNote);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { t } = useTranslations();

  useEffect(() => {
    setFormData(deliveryNote);
  }, [deliveryNote]);

  /** ===== WORK ORDER ITEMS ===== */
  const handleAddNewItem = (workOrderIndex: number) => {
    const newItem: DeliveryNoteItem = {
      description: 'Nou Concepte',
      quantity: 1,
      unitPrice: 0,
      discountPercentage: 0,
      discountAmount: 0,
      lineTotal: 0,
      taxPercentage: 21,
      type: DeliveryNoteItemType.Labor,
    };

    const updatedWorkOrders = [...formData.workOrders];
    updatedWorkOrders[workOrderIndex].items.push(newItem);

    recalculateTotals(updatedWorkOrders);
  };

  const handleItemUpdate = (
    workOrderIndex: number,
    itemIndex: number,
    field: keyof DeliveryNoteItem,
    value: string | number | DeliveryNoteItemType
  ) => {
    const updatedWorkOrders = [...formData.workOrders];
    const item = updatedWorkOrders[workOrderIndex].items[itemIndex];

    // Actualizar el campo
    const updatedItem = {
      ...item,
      [field]: value,
    };

    updatedWorkOrders[workOrderIndex].items[itemIndex] = updatedItem;

    // Recalcular línea si cambian campos que afectan el total
    if (
      field === 'quantity' ||
      field === 'unitPrice' ||
      field === 'discountPercentage' ||
      field === 'taxPercentage'
    ) {
      const subtotalBeforeDiscount =
        updatedItem.quantity * updatedItem.unitPrice;
      updatedItem.discountAmount =
        subtotalBeforeDiscount * (updatedItem.discountPercentage / 100);
      updatedItem.lineTotal =
        subtotalBeforeDiscount - updatedItem.discountAmount;

      updatedWorkOrders[workOrderIndex].items[itemIndex] = updatedItem;
    }

    recalculateTotals(updatedWorkOrders);
  };

  const handleRemoveItem = (workOrderIndex: number, itemIndex: number) => {
    const updatedWorkOrders = [...formData.workOrders];
    updatedWorkOrders[workOrderIndex].items.splice(itemIndex, 1);
    recalculateTotals(updatedWorkOrders);
  };

  const handleUpdateConcept = (workOrderIndex: number, value: string) => {
    const updatedWorkOrders = [...formData.workOrders];
    updatedWorkOrders[workOrderIndex].concept = value;
    setFormData(prev => ({ ...prev, workOrders: updatedWorkOrders }));
  };

  const recalculateTotals = (updatedWorkOrders: DeliveryNoteWorkOrder[]) => {
    let subtotal = 0;
    let totalTax = 0;
    const taxMap = new Map<
      number,
      { taxableBase: number; taxAmount: number }
    >();

    updatedWorkOrders.forEach(wo => {
      wo.items.forEach(item => {
        const lineTotal = item.lineTotal;
        const taxPercentage = item.taxPercentage || 21;
        const taxAmount = lineTotal * (taxPercentage / 100);

        subtotal += lineTotal;
        totalTax += taxAmount;

        // Agrupar por porcentaje de IVA
        const current = taxMap.get(taxPercentage) || {
          taxableBase: 0,
          taxAmount: 0,
        };
        taxMap.set(taxPercentage, {
          taxableBase: current.taxableBase + lineTotal,
          taxAmount: current.taxAmount + taxAmount,
        });
      });
    });

    // Convertir el Map a array de TaxBreakdown
    const taxBreakdowns = Array.from(taxMap.entries()).map(
      ([taxPercentage, values]) => ({
        taxPercentage,
        taxableBase: values.taxableBase,
        taxAmount: values.taxAmount,
      })
    );

    const total = subtotal + totalTax;

    setFormData(prev => ({
      ...prev,
      workOrders: updatedWorkOrders,
      subtotal,
      totalTax,
      total,
      taxBreakdowns,
    }));
  };

  /** ===== FORM VALIDATION & SUBMIT ===== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const updateRequest: DeliveryNoteUpdateRequest = {
        id: formData.id,
        externalComments: formData.externalComments ?? '',
        status: formData.status,
        workOrders: formData.workOrders,
      };

      await onUpdate(updateRequest);

      setTimeout(() => setIsLoading(false), 1000);
    } catch (error) {
      console.error('Error updating delivery note:', error);
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.deliveryNoteDate?.trim()) {
      newErrors.deliveryNoteDate = 'La data es obligatoria';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <HeaderForm
          header={formData.code}
          isCreate={false}
          canPrint={`deliveryNote?id=${formData.id}`}
        />

        {/* Form */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Delivery Note Top */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="font-semibold">Albarà</label>
                <div className="p-2 bg-gray-50 rounded border text-gray-700">
                  {formData.code}
                </div>
              </div>

              <div className="space-y-2 flex flex-col">
                <label className="font-semibold">Data</label>
                <DatePicker
                  selected={
                    formData.deliveryNoteDate
                      ? new Date(formData.deliveryNoteDate)
                      : new Date()
                  }
                  onChange={(date: Date | null) =>
                    setFormData(prev => ({
                      ...prev,
                      deliveryNoteDate:
                        date?.toISOString().split('T')[0] ||
                        new Date().toISOString().split('T')[0],
                    }))
                  }
                  dateFormat="dd/MM/yyyy"
                  locale={ca}
                  className={cn(
                    'flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm',
                    errors.deliveryNoteDate && 'border-destructive'
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="font-semibold">Estat</label>
                <select
                  value={formData.status}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      status: Number(e.target.value) as DeliveryNoteStatus,
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                >
                  {Object.values(DeliveryNoteStatus)
                    .filter(v => typeof v === 'number')
                    .map(status => (
                      <option key={status} value={status}>
                        {translateDeliveryNoteStatus(
                          status as DeliveryNoteStatus
                        )}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Customer Installation */}
            {formData.installation?.code && (
              <InstallationComponent installation={formData.installation} />
            )}

            {/* Company Information */}
            <CustomerInformationComponent
              companyName={formData.companyName || ''}
              customerAddress={formData.customerAddress}
            />

            {/* Work Orders */}
            {formData.workOrders.map((wo, woIndex) => (
              <div
                key={wo.workOrderId}
                className="p-4 bg-blue-50 rounded-lg space-y-2"
              >
                <h3 className="font-semibold mb-2">
                  {wo.workOrderCode} - {wo.workOrderRefId}{' '}
                  {dayjs(wo.workOrderStartTime).format('DD/MM/YYYY')}
                </h3>

                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Concepte:</span>
                  <EditableCell
                    value={wo.concept}
                    onUpdate={value => handleUpdateConcept(woIndex, value)}
                    canEdit={true}
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 border text-left">Descripció</th>
                        <th className="p-2 border text-center">Quantitat</th>
                        <th className="p-2 border text-center">Preu Unitari</th>
                        <th className="p-2 border text-center">% Dte.</th>
                        <th className="p-2 border text-center">Import Dte.</th>
                        <th className="p-2 border text-center">Total Línia</th>
                        <th className="p-2 border text-center">% IVA</th>
                        <th className="p-2 border text-center">Accions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wo.items.map((item, itemIndex) => (
                        <tr key={itemIndex} className="border-t">
                          <td className="p-2 border">
                            <EditableCell
                              value={item.description}
                              onUpdate={value =>
                                handleItemUpdate(
                                  woIndex,
                                  itemIndex,
                                  'description',
                                  value
                                )
                              }
                              canEdit={true}
                            />
                          </td>
                          <td className="p-2 border text-center">
                            <EditableCell
                              value={item.quantity.toString()}
                              onUpdate={value =>
                                handleItemUpdate(
                                  woIndex,
                                  itemIndex,
                                  'quantity',
                                  Number(value)
                                )
                              }
                              canEdit={true}
                            />
                          </td>
                          <td className="p-2 border text-center">
                            <EditableCell
                              value={item.unitPrice.toString()}
                              onUpdate={value =>
                                handleItemUpdate(
                                  woIndex,
                                  itemIndex,
                                  'unitPrice',
                                  Number(value)
                                )
                              }
                              canEdit={true}
                            />
                          </td>
                          <td className="p-2 border text-center">
                            <EditableCell
                              value={item.discountPercentage?.toString() ?? '0'}
                              onUpdate={value =>
                                handleItemUpdate(
                                  woIndex,
                                  itemIndex,
                                  'discountPercentage',
                                  Number(value)
                                )
                              }
                              canEdit={true}
                            />
                          </td>
                          <td className="p-2 border text-center">
                            {formatEuropeanCurrency(item.discountAmount, t)}
                          </td>
                          <td className="p-2 border text-center">
                            {formatEuropeanCurrency(item.lineTotal, t)}
                          </td>
                          <td className="p-2 border text-center">
                            <EditableCell
                              value={item.taxPercentage?.toString() ?? '21'}
                              onUpdate={value =>
                                handleItemUpdate(
                                  woIndex,
                                  itemIndex,
                                  'taxPercentage',
                                  Number(value)
                                )
                              }
                              canEdit={true}
                            />
                          </td>
                          <td className="p-2 border text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveItem(woIndex, itemIndex)
                              }
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Item Button */}
                <Button
                  type="create"
                  onClick={() => handleAddNewItem(woIndex)}
                  variant="outline"
                  className="flex items-center gap-2 mt-2"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Totals */}
            <TotalComponent
              subtotal={formData.subtotal}
              totalTax={formData.totalTax}
              total={formData.total}
              taxBreakdowns={formData.taxBreakdowns}
            />

            {/* External Comments */}
            <div className="space-y-2">
              <label htmlFor="comment" className="font-semibold">
                Comentaris Externs
              </label>
              <Textarea
                id="comment"
                placeholder="Comentaris addicionals..."
                value={formData.externalComments || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    externalComments: e.target.value,
                  }))
                }
                className="min-h-[100px]"
              />
            </div>

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
                type="delete"
                variant="outline"
                onClick={() => onDelete(formData.id)}
                className="flex-1"
                customStyles="flex justify-center"
              >
                <X className="mr-2 h-4 w-4" />
                <p>Eliminar</p>
              </Button>
              <Button
                type="cancel"
                variant="outline"
                onClick={() =>
                  router.push(ROUTES.deliveryNote?.list || '/deliveryNotes')
                }
                className="flex-1"
                customStyles="flex justify-center"
                disabled={isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                <p>Cancel·lar</p>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
