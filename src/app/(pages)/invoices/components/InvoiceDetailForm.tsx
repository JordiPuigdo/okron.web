'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { formatEuropeanCurrency } from 'app/utils/utils';
import { CustomerInformationComponent } from 'components/customer/CustomerInformationComponent';
import { InstallationComponent } from 'components/customer/InstallationComponent';
import { TotalComponent } from 'components/customer/TotalComponent';
import { Input } from 'components/input/Input';
import dayjs from 'dayjs';
import { Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { HeaderForm } from '../../../../components/layout/HeaderForm';
import { Button } from '../../../../designSystem/Button/Buttons';
import { SvgSpinner } from '../../../icons/icons';
import {
  Invoice,
  InvoiceStatus,
  InvoiceUpdateRequest,
} from '../../../interfaces/Invoice';
import useRoutes from '../../../utils/useRoutes';

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

  useEffect(() => {
    setFormData(invoice);
  }, [invoice]);

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
  const { subtotal, totalTax, total } = useMemo(() => {
    if (!formData.deliveryNotes) return {};
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
                  companyName={formData.deliveryNotes[0].companyName}
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
                  <h3 className="font-semibold">{dn.code}</h3>
                  <span>
                    Data: {new Date(dn.deliveryNoteDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Items */}
                {dn.workOrders.map((wo, woIndex) => (
                  <div key={wo.workOrderId} className="mb-4">
                    <h4 className="font-semibold mb-1">
                      {wo.workOrderCode} - {wo.workOrderRefId}
                    </h4>
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

            {/* Totals */}
            <TotalComponent
              subtotal={subtotal || 0}
              totalTax={totalTax || 0}
              total={total || 0}
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
    </div>
  );
}
