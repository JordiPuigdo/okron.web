import { Invoice } from 'app/interfaces/Invoice';
import dayjs from 'dayjs';

import companyData from '../../order/company.json';

interface CompanyInfo {
  name: string;
  cif: string;
  address: string;
  city: string;
  phone: string;
  email: string;
}

export const InvoiceHeader = ({ invoice }: { invoice: Invoice }) => {
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL!;
  const company: CompanyInfo = companyData;

  const translateInvoiceStatus = (status: number): string => {
    switch (status) {
      case 0: return 'Borrador';
      case 1: return 'Pendent';
      case 2: return 'Pagada';
      case 3: return 'Cancel·lada';
      case 4: return 'Vençuda';
      default: return 'Desconegut';
    }
  };

  return (
    <div>
      <div className="flex justify-between">
        <img
          src={logoUrl}
          alt="Components Mecànics Logo"
          className="h-[150px] w-[150px] p-2"
        />
        <div className="flex">
          <div className="border p-2 my-6">
            <p className="relative">Factura</p>
            <div className="p-4">
              <p className="font-semibold">{invoice.code}</p>
            </div>
          </div>
          <div className="border p-2 my-6">
            <p className="relative">Data</p>
            <div className="p-4">
              <p className="font-semibold">
                {dayjs(invoice.date).format('DD/MM/YYYY')}
              </p>
            </div>
          </div>
          <div className="border p-2 my-6">
            <p className="relative">Venciment</p>
            <div className="p-4">
              <p className="font-semibold">
                {dayjs(invoice.dueDate).format('DD/MM/YYYY')}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between items-start">
        <div>
          <p className="font-semibold">{company.name}</p>
          <p>{company.cif}</p>
          <p className="font-semibold">{company.address}</p>
          <p>{company.city}</p>
          <p>Tel: {company.phone}</p>
          <p>{company.email}</p>
        </div>
        <div className="flex flex-col justify-center items-end">
          <p className="font-semibold">{invoice.customer?.name}</p>
          <p>{invoice.customer?.taxId}</p>
          {invoice.customer?.installations && invoice.customer?.installations[0] && (
            <>
              <p className="font-semibold">{invoice.customer.installations[0].address.address}</p>
              <p>{invoice.customer.installations[0].address.city}</p>
            </>
          )}
        </div>
      </div>

      {/* Work Orders Section */}
      {invoice.workOrders && invoice.workOrders.length > 0 && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Ordres de Treball:</h3>
          <div className="grid grid-cols-2 gap-2">
            {invoice.workOrders.map((workOrder, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium">{workOrder.code}:</span> {workOrder.description}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};