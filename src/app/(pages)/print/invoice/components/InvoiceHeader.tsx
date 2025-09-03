import { SystemConfiguration } from 'app/interfaces/Config';
import { Invoice } from 'app/interfaces/Invoice';
import dayjs from 'dayjs';

export const InvoiceHeader = ({
  invoice,
  config,
}: {
  invoice: Invoice;
  config: SystemConfiguration;
}) => {
  //const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL!;
  const company = config.company;

  return (
    <div>
      <div className="flex justify-between">
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
                {dayjs(invoice.invoiceDate).format('DD/MM/YYYY')}
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
          <p>{company.nif}</p>
          <p className="font-semibold">{company.address.address}</p>
          <p>{company.address.city}</p>
          <p>Tel: {company.phone}</p>
          <p>{company.email}</p>
        </div>
        <div className="flex flex-col justify-center items-end">
          <p className="font-semibold">{invoice.companyName}</p>
          <p className="font-semibold">{invoice.companyAddress}</p>
          <p>{invoice.companyCity}</p>
          {invoice.companyPostalCode && <p>{invoice.companyPostalCode}</p>}
          {invoice.companyProvince && <p>{invoice.companyProvince}</p>}
        </div>
      </div>

      {/* Delivery Note Section */}
      {invoice.deliveryNoteId && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Albarà:</h3>
          <div className="text-sm">
            <span className="font-medium">ID:</span> {invoice.deliveryNoteId}
          </div>
        </div>
      )}
    </div>
  );
};
