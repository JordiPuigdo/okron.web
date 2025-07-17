'use client';

import { useEffect,useState } from 'react';
import { SvgDocument, SvgPlus } from 'app/icons/icons';
import InvoiceService from 'app/services/invoiceService';
import { formatDate, getInvoiceStatusColor,translateInvoiceStatus } from 'app/utils/utils';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';
import { Button } from 'designSystem/Button/Buttons';
import { useRouter } from 'next/navigation';

import { InvoiceDto } from '../../interfaces/InvoiceInterfaces';

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const invoiceService = new InvoiceService(process.env.NEXT_PUBLIC_API_BASE_URL!);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await invoiceService.getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex p-2 my-2 justify-between items-center">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-black flex gap-2">
            <SvgDocument />
            Factures
          </h2>
          <span className="text-l">Facturació - Llistat de Factures</span>
        </div>
        <Button
          onClick={() => router.push('/invoices/create')}
          type="create"
          className="flex items-center gap-2"
        >
          <SvgPlus className="w-4 h-4" />
          Nova Factura
        </Button>
      </div>
    );
  };

  return (
    <MainLayout>
      <Container>
        <div className="flex flex-col h-full">
          {renderHeader()}

          {/* Invoices Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Codi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Factura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Venciment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accions
                  </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.companyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.invoiceDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInvoiceStatusColor(invoice.status)}`}>
                          {translateInvoiceStatus(invoice.status)}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.total.toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        onClick={() => router.push(`/invoices/${invoice.id}`)}
                        type="none"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Veure
                      </Button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>

            {isLoading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {!isLoading && invoices.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hi ha factures disponibles
              </div>
            )}
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}