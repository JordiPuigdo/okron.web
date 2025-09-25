import { SystemConfiguration } from 'app/interfaces/Config';
import { DeliveryNote } from 'app/interfaces/DeliveryNote';
import dayjs from 'dayjs';

import { CompanyInformationHeader } from '../../components/CompanyInformationHeader';

export const DeliveryNoteHeader = ({
  deliveryNote,
  config,
}: {
  deliveryNote: DeliveryNote;
  config: SystemConfiguration;
}) => {
  const company = config.company;

  return (
    <div className="rounded-lg border border-gray-200 print:border-0 print:p-2 ">
      {/* Logo and Document Title */}
      <div className="flex justify-between items-end pb-4">
        <div className="w-48 h-16 relative">
          <img
            src={company.urlLogo}
            alt={company.name}
            className="object-contain object-left"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-gray-200">
          <div className="text-center p-2 bg-gray-100 rounded-md align-bottom">
            <p className="text-xs font-medium text-gray-600">Número d'Albarà</p>
            <p className="text-lg font-bold text-gray-800">
              {deliveryNote.code}
            </p>
          </div>
          <div className="text-center p-2 bg-gray-100 rounded-md">
            <p className="text-xs font-medium text-gray-600">Data</p>
            <p className="text-lg font-bold text-gray-800">
              {dayjs(deliveryNote.deliveryNoteDate).format('DD/MM/YYYY')}
            </p>
          </div>
        </div>
      </div>
      <CompanyInformationHeader company={company} />

      {/* Client Information */}
      <div className="flex flex-col border-t-2 border-black border-b-2 ">
        <div className="flex flex-col flex-grow justify-between">
          {/* Primera sección: Información básica */}
          <div className="space-y-2">
            <p className="font-medium text-gray-900">
              {deliveryNote.companyName}
            </p>
          </div>

          {/* Segunda sección: Dirección hasta provincia */}
          <div className="text-sm text-gray-700 space-y-1">
            <p className="flex">
              <span className="line-clamp-2">
                {deliveryNote.customerAddress.address}
              </span>
            </p>
            <p>
              {deliveryNote.customerAddress.postalCode},{' '}
              {deliveryNote.customerAddress.city}
            </p>
            <p>{deliveryNote.customerAddress.province}</p>
          </div>

          {/* Tercera sección: NIF y contacto (alineado al bottom) */}
          <div className="">
            <p className="text-sm text-gray-600">{deliveryNote.customerNif}</p>
            <p className="text-sm text-gray-600">
              {deliveryNote.customerPhone}
            </p>
            <p className="text-sm text-gray-600 break-all">
              {deliveryNote.customerEmail}
            </p>
          </div>
        </div>
      </div>

      {/* Delivery Note Details */}
    </div>
  );
};
