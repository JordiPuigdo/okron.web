import { SystemConfiguration } from 'app/interfaces/Config';
import { Invoice, InvoiceType } from 'app/interfaces/Invoice';
import dayjs from 'dayjs';

import { CompanyInformationHeader } from '../../components/CompanyInformationHeader';

export const InvoiceHeader = ({
  invoice,
  config,
}: {
  invoice: Invoice;
  config: SystemConfiguration;
}) => {
  const company = config.company;

  return (
    <div className="rounded-lg border  print:border-0 print:p-2 ">
      {/* Logo and Document Title */}
      <div className="flex justify-between items-end">
        <div className="relative">
          <img
            src={company.urlLogo}
            alt={company.name}
            className="h-16 w-auto object-contain"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-gray-200">
          <div className="text-center px-3 py-1 bg-blue-100 rounded-md align-bottom">
            <p className="text-xs font-medium text-gray-600">
              {invoice.invoiceType === InvoiceType.Proforma
                ? 'Factura Proforma'
                : 'Número Factura'}
            </p>
            <p className="text-base font-bold text-gray-800">{invoice.code}</p>
          </div>
          <div className="text-center px-3 py-1 bg-blue-100 rounded-md">
            <p className="text-xs font-medium text-gray-600">Data</p>
            <p className="text-base font-bold text-gray-800">
              {dayjs(invoice.creationDate).format('DD/MM/YYYY')}
            </p>
          </div>
        </div>
      </div>
      <CompanyInformationHeader company={company} />

      {/* Client Information */}
      <div className="flex flex-col border-t-2 border-blue-100 border-b-2 py-1">
        <p className="text-sm font-medium text-gray-900">
          {invoice.deliveryNotes[0].companyName}
        </p>

        <div className="text-xs text-gray-700">
          <p className="line-clamp-2">
            {invoice.deliveryNotes[0].customerAddress.address}
          </p>
          <p>
            {invoice.deliveryNotes[0].customerAddress.postalCode},{' '}
            {invoice.deliveryNotes[0].customerAddress.city}
          </p>
          <p>{invoice.deliveryNotes[0].customerAddress.province}</p>
        </div>

        <div className="text-xs text-gray-600">
          <p>{invoice.deliveryNotes[0].customerNif}</p>
          <p>{invoice.deliveryNotes[0].customerPhone}</p>
          <p className="break-all">
            {invoice.deliveryNotes[0].customerEmail}
          </p>
        </div>
      </div>

      {/* Delivery Note Details */}
    </div>
  );
};
