'use client';

import { useEffect, useState } from 'react';
import InvoiceService from 'app/services/invoiceService';
import { formatDate, translateInvoiceStatus } from 'app/utils/utils';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';
import { Button } from 'designSystem/Button/Buttons';
import { useRouter } from 'next/navigation';

import { InvoiceDto } from '../../../interfaces/InvoiceInterfaces';

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const invoiceService = new InvoiceService(process.env.NEXT_PUBLIC_API_BASE_URL!);

  useEffect(() => {
    loadInvoice();
  }, [params.id]);

  const loadInvoice = async () => {
    setIsLoading(true);
    try {
      const data = await invoiceService.getInvoiceById(params.id);
      setInvoice(data);
    } catch (error) {
      console.error('Error loading invoice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      const blob = await invoiceService.exportToPdf(params.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${invoice?.code}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <Container>
          <div className="text-center py-8">Carregant factura...</div>
        </Container>
      </MainLayout>
    );
  }

  if (!invoice) {
    return (
      <MainLayout>
        <Container>
          <div className="text-center py-8 text-red-500">
            Error carregant la factura
          </div>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Factura {invoice.code}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {translateInvoiceStatus(invoice.status)} | {formatDate(invoice.invoiceDate)}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
                type="none"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Editar
              </Button>
              <Button
                onClick={handleExportPdf}
                type="none"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Exportar PDF
              </Button>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Informació del Client
            </h3>
            <div>
              <p className="font-medium">{invoice.companyName}</p>
              <p className="text-gray-600">{invoice.companyAddress}</p>
              <p className="text-gray-600">
                {invoice.companyCity}, {invoice.companyPostalCode}
              </p>
              <p className="text-gray-600">{invoice.companyProvince}</p>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Items de la Factura
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripció
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantitat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preu Unit.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.unitPrice.toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.lineTotal.toFixed(2)}€
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-end">
              <div className="w-80">
                <div className="flex justify-between py-2">
                  <span>Subtotal:</span>
                  <span>{invoice.subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>IVA (21%):</span>
                  <span>{invoice.totalTax.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-200 font-bold">
                  <span>Total:</span>
                  <span>{invoice.total.toFixed(2)}€</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}