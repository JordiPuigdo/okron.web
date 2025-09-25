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
      </div>
    </div>
  );
};
