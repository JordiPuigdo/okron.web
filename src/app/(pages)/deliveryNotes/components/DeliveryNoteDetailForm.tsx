'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { formatEuropeanCurrency } from 'app/utils/utils';
import { ca } from 'date-fns/locale';
import { Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { HeaderForm } from '../../../../components/layout/HeaderForm';
import { Textarea } from '../../../../components/textarea';
import { Button } from '../../../../designSystem/Button/Buttons';
import { SvgSpinner } from '../../../icons/icons';
import {
  DeliveryNote,
  DeliveryNoteItem,
  DeliveryNoteStatus,
  DeliveryNoteUpdateRequest,
} from '../../../interfaces';
import { cn } from '../../../lib/utils';
import useRoutes from '../../../utils/useRoutes';
import { EditableCell } from '../../machines/downtimes/components/EditingCell';

interface DeliveryNoteDetailFormProps {
  deliveryNote: DeliveryNote;
  onUpdate: (deliveryNote: DeliveryNoteUpdateRequest) => Promise<void>;
}

export function DeliveryNoteDetailForm({
  deliveryNote,
  onUpdate,
}: DeliveryNoteDetailFormProps) {
  const router = useRouter();
  const ROUTES = useRoutes();

  const [formData, setFormData] = useState<DeliveryNote>(deliveryNote);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(deliveryNote);
  }, [deliveryNote]);

  const translateDeliveryNoteStatus = (status: DeliveryNoteStatus): string => {
    switch (status) {
      case DeliveryNoteStatus.Draft:
        return 'Borrador';
      case DeliveryNoteStatus.Sent:
        return 'Enviat';
      case DeliveryNoteStatus.Paid:
        return 'Pagat';
      case DeliveryNoteStatus.Cancelled:
        return 'Cancel·lat';
      case DeliveryNoteStatus.Overdue:
        return 'Vençut';
      default:
        return 'Desconegut';
    }
  };

  const handleItemUpdate = (
    itemIndex: number,
    field: keyof DeliveryNoteItem,
    value: any
  ) => {
    const updatedItems = [...formData.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      [field]: value,
    };

    // Recalculate totals for the item
    if (
      field === 'quantity' ||
      field === 'unitPrice' ||
      field === 'discountPercentage'
    ) {
      const item = updatedItems[itemIndex];
      const subtotalBeforeDiscount = item.quantity * item.unitPrice;
      item.discountAmount =
        subtotalBeforeDiscount * (item.discountPercentage / 100);
      item.lineTotal = subtotalBeforeDiscount - item.discountAmount;
    }

    const subtotal = updatedItems.reduce(
      (sum, item) => sum + item.lineTotal,
      0
    );
    const totalTax = subtotal * 0.21; // 21% IVA
    const total = subtotal + totalTax;

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      subtotal,
      totalTax,
      total,
    }));
  };

  const handleRemoveItem = (itemIndex: number) => {
    const updatedItems = formData.items.filter(
      (_, index) => index !== itemIndex
    );
    const subtotal = updatedItems.reduce(
      (sum, item) => sum + item.lineTotal,
      0
    );
    const totalTax = subtotal * 0.21;
    const total = subtotal + totalTax;

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      subtotal,
      totalTax,
      total,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);

    try {
      const updateRequest: DeliveryNoteUpdateRequest = {
        id: formData.id,
        externalComments: formData.externalComments ?? '',
        status: formData.status,
        items: formData.items,
        companyName: formData.companyName,
        companyAddress: formData.companyAddress,
      };

      await onUpdate(updateRequest);

      setTimeout(() => {
        setIsLoading(false);
        router.push(ROUTES.deliveryNote?.list || '/deliveryNotes');
      }, 1000);
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

    if (!formData.items || formData.items.length === 0) {
      newErrors.items = "L'albarà ha de tenir almenys un element";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <HeaderForm
          header={formData.code}
          isCreate={false}
          canPrint={`deliveryNote?id=${formData.id}`}
        />

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Information */}
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
                    .filter(value => typeof value === 'number')
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

            {/* Company Information */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Informació de l'Empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Nom:</span>{' '}
                  {formData.companyName}
                </div>
                <div>
                  <span className="font-medium">Adreça:</span>{' '}
                  {formData.companyAddress}
                </div>
                <div>
                  <span className="font-medium">Ciutat:</span>{' '}
                  {formData.companyCity}
                </div>
                <div>
                  <span className="font-medium">Codi Postal:</span>{' '}
                  {formData.companyPostalCode}
                </div>
                {formData.companyProvince && (
                  <div>
                    <span className="font-medium">Província:</span>{' '}
                    {formData.companyProvince}
                  </div>
                )}
              </div>
            </div>

            {/* Work Orders */}
            {formData.concepts && formData.concepts.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Conceptes: </h3>
                <div className="space-y-2">
                  {formData.concepts.map(woId => (
                    <div key={woId} className="flex justify-between">
                      <span>{woId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Note Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Elements de l'Albarà</h3>

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
                      <th className="p-2 border text-center">Accions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2 border">
                          <EditableCell
                            value={item.description}
                            onUpdate={value =>
                              handleItemUpdate(index, 'description', value)
                            }
                            canEdit={true}
                          />
                        </td>
                        <td className="p-2 border text-center">
                          <EditableCell
                            value={item.quantity.toString()}
                            onUpdate={value =>
                              handleItemUpdate(index, 'quantity', Number(value))
                            }
                            canEdit={true}
                          />
                        </td>
                        <td className="p-2 border text-center">
                          <EditableCell
                            value={item.unitPrice.toString()}
                            onUpdate={value =>
                              handleItemUpdate(
                                index,
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
                                index,
                                'discountPercentage',
                                Number(value)
                              )
                            }
                            canEdit={true}
                          />
                        </td>
                        <td className="p-2 border text-center">
                          {formatEuropeanCurrency(item.discountAmount)}
                        </td>
                        <td className="p-2 border text-center">
                          {formatEuropeanCurrency(item.lineTotal)}
                        </td>
                        <td className="p-2 border text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
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

              {errors.items && (
                <p className="text-destructive text-sm text-red-500">
                  {errors.items}
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-96 space-y-2 p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatEuropeanCurrency(formData.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (21%):</span>
                  <span>{formatEuropeanCurrency(formData.totalTax)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatEuropeanCurrency(formData.total)}</span>
                </div>
              </div>
            </div>

            {/* Comment */}
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
