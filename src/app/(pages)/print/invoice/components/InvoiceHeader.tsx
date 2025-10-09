import { SystemConfiguration } from 'app/interfaces/Config';
import { Invoice } from 'app/interfaces/Invoice';
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
        <div className="w-96 relative ">
          <img src={company.urlLogo} alt={company.name} className="w-96 h-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-gray-200">
          <div className="text-center p-2 bg-blue-100 rounded-md align-bottom">
            <p className="text-xs font-medium text-gray-600">Número Factura</p>
            <p className="text-lg font-bold text-gray-800">{invoice.code}</p>
          </div>
          <div className="text-center p-2 bg-blue-100 rounded-md">
            <p className="text-xs font-medium text-gray-600">Data</p>
            <p className="text-lg font-bold text-gray-800">
              {dayjs(invoice.creationDate).format('DD/MM/YYYY')}
            </p>
          </div>
        </div>
      </div>
      <CompanyInformationHeader company={company} />

      {/* Client Information */}
      <div className="flex flex-col border-t-2 border-blue-100 border-b-2 ">
        <div className="flex flex-col flex-grow justify-between">
          {/* Primera sección: Información básica */}
          <div className="space-y-2">
            <p className="font-medium text-gray-900">
              {invoice.deliveryNotes[0].companyName}
            </p>
          </div>

          {/* Segunda sección: Dirección hasta provincia */}
          <div className="text-sm text-gray-700 space-y-1">
            <p className="flex">
              <span className="line-clamp-2">
                {invoice.deliveryNotes[0].customerAddress.address}
              </span>
            </p>
            <p>
              {invoice.deliveryNotes[0].customerAddress.postalCode},{' '}
              {invoice.deliveryNotes[0].customerAddress.city}
            </p>
            <p>{invoice.deliveryNotes[0].customerAddress.province}</p>
          </div>

          {/* Tercera sección: NIF y contacto (alineado al bottom) */}
          <div className="">
            <p className="text-sm text-gray-600">
              {invoice.deliveryNotes[0].customerNif}
            </p>
            <p className="text-sm text-gray-600">
              {invoice.deliveryNotes[0].customerPhone}
            </p>
            <p className="text-sm text-gray-600 break-all">
              {invoice.deliveryNotes[0].customerEmail}
            </p>
          </div>
        </div>
      </div>

      {/* Delivery Note Details */}
    </div>
  );
};
