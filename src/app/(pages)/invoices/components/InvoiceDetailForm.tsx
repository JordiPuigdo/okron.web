'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { ca } from 'date-fns/locale';
import { Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { HeaderForm } from '../../../../components/layout/HeaderForm';
import { Textarea } from '../../../../components/textarea';
import { Button } from '../../../../designSystem/Button/Buttons';
import { SvgSpinner } from '../../../icons/icons';
import { Invoice, InvoiceItem, InvoiceStatus, InvoiceUpdateRequest } from '../../../interfaces/Invoice';
import { cn } from '../../../lib/utils';
import useRoutes from '../../../utils/useRoutes';
import { EditableCell } from '../../machines/downtimes/components/EditingCell';

interface InvoiceDetailFormProps {
  invoice: Invoice;
  onUpdate: (invoice: InvoiceUpdateRequest) => Promise<void>;
}

export function InvoiceDetailForm({ invoice, onUpdate }: InvoiceDetailFormProps) {
  const router = useRouter();
  const ROUTES = useRoutes();

  const [formData, setFormData] = useState<Invoice>(invoice);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(invoice);
  }, [invoice]);

  const translateInvoiceStatus = (status: InvoiceStatus): string => {
    switch (status) {
      case InvoiceStatus.Draft:
        return 'Borrador';
      case InvoiceStatus.Pending:
        return 'Pendent';
      case InvoiceStatus.Paid:
        return 'Pagada';
      case InvoiceStatus.Cancelled:
        return 'Cancel·lada';
      case InvoiceStatus.Overdue:
        return 'Vençuda';
      default:
        return 'Desconegut';
    }
  };

  const handleItemUpdate = (itemIndex: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      [field]: value,
    };

    // Recalculate totals for the item
    if (field === 'quantity' || field === 'unitPrice' || field === 'discountPercentage') {
      const item = updatedItems[itemIndex];
      const subtotalBeforeDiscount = item.quantity * item.unitPrice;
      item.discountAmount = subtotalBeforeDiscount * (item.discountPercentage / 100);
      item.lineTotal = subtotalBeforeDiscount - item.discountAmount;
    }

    const subtotal = updatedItems.reduce((sum, item) => sum + item.lineTotal, 0);
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
    const updatedItems = formData.items.filter((_, index) => index !== itemIndex);
    const subtotal = updatedItems.reduce((sum, item) => sum + item.lineTotal, 0);
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
      const updateRequest: InvoiceUpdateRequest = {
        id: formData.id,
        date: formData.invoiceDate,
        dueDate: formData.dueDate,
        status: formData.status,
        items: formData.items,
        comment: formData.externalComments || undefined,
      };

      await onUpdate(updateRequest);

      // Show success message or redirect
      setTimeout(() => {
        setIsLoading(false);
        router.push(ROUTES.invoices.list);
      }, 1000);
    } catch (error) {
      console.error('Error updating invoice:', error);
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.invoiceDate?.trim()) {
      newErrors.invoiceDate = 'La data es obligatoria';
    }

    if (!formData.dueDate?.trim()) {
      newErrors.dueDate = 'La data de venciment es obligatoria';
    }

    if (!formData.items || formData.items.length === 0) {
      newErrors.items = 'La factura ha de tenir almenys un element';
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
          canPrint={`invoice?id=${formData.id}`}
        />

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="font-semibold">Codi</label>
                <div className="p-2 bg-gray-50 rounded border text-gray-700">
                  {formData.code}
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold">Data</label>
                <DatePicker
                  selected={formData.invoiceDate ? new Date(formData.invoiceDate) : new Date()}
                  onChange={(date: Date) =>
                    setFormData(prev => ({
                      ...prev,
                      invoiceDate: date.toISOString().split('T')[0]
                    }))
                  }
                  dateFormat="dd/MM/yyyy"
                  locale={ca}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm",
                    errors.invoiceDate && 'border-destructive'
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="font-semibold">Data de Venciment</label>
                <DatePicker
                  selected={formData.dueDate ? new Date(formData.dueDate) : null}
                  onChange={(date: Date) =>
                    setFormData(prev => ({
                      ...prev,
                      dueDate: date.toISOString().split('T')[0]
                    }))
                  }
                  dateFormat="dd/MM/yyyy"
                  locale={ca}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm",
                    errors.dueDate && 'border-destructive'
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="font-semibold">Estat</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    status: Number(e.target.value) as InvoiceStatus
                  }))}
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
            </div>

            {/* Company Information */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Informació de l'Empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Nom:</span> {formData.companyName}
                </div>
                <div>
                  <span className="font-medium">Adreça:</span> {formData.companyAddress}
                </div>
                <div>
                  <span className="font-medium">Ciutat:</span> {formData.companyCity}
                </div>
                <div>
                  <span className="font-medium">Codi Postal:</span> {formData.companyPostalCode}
                </div>
                {formData.companyProvince && (
                  <div>
                    <span className="font-medium">Província:</span> {formData.companyProvince}
                  </div>
                )}
              </div>
            </div>

            {/* Work Orders */}
            {formData.workOrderIds && formData.workOrderIds.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Ordres de Treball Vinculades</h3>
                <div className="space-y-2">
                  {formData.workOrderIds.map(woId => (
                    <div key={woId} className="flex justify-between">
                      <span>{woId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invoice Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Elements de la Factura</h3>

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
                          onUpdate={(value) => handleItemUpdate(index, 'description', value)}
                          canEdit={true}
                        />
                      </td>
                      <td className="p-2 border text-center">
                        <EditableCell
                          value={item.quantity.toString()}
                          onUpdate={(value) => handleItemUpdate(index, 'quantity', Number(value))}
                          canEdit={true}
                        />
                      </td>
                      <td className="p-2 border text-center">
                        <EditableCell
                          value={item.unitPrice.toString()}
                          onUpdate={(value) => handleItemUpdate(index, 'unitPrice', Number(value))}
                          canEdit={true}
                        />
                      </td>
                      <td className="p-2 border text-center">
                        <EditableCell
                          value={item.discountPercentage?.toString() ?? '0'}
                          onUpdate={(value) => handleItemUpdate(index, 'discountPercentage', Number(value))}
                          canEdit={true}
                        />
                      </td>
                      <td className="p-2 border text-center">
                        {item.discountAmount !== undefined && item.discountAmount !== null && !isNaN(item.discountAmount)
                          ? `${parseFloat(item.discountAmount.toString()).toFixed(2)}€`
                          : 'N/A'}
                      </td>
                      <td className="p-2 border text-center">
                        {item.lineTotal !== undefined && item.lineTotal !== null && !isNaN(item.lineTotal)
                          ? `${parseFloat(item.lineTotal.toString()).toFixed(2)}€`
                          : 'N/A'}
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
                  <span>{formData.subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (21%):</span>
                  <span>{formData.totalTax !== undefined && formData.totalTax !== null ? formData.totalTax.toFixed(2) : '0.00'}€</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formData.total.toFixed(2)}€</span>
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
                  setFormData(prev => ({ ...prev, externalComments: e.target.value }))
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
    </div>
  );
}