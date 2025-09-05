import { SystemConfiguration } from 'app/interfaces/Config';
import { DeliveryNote } from 'app/interfaces/DeliveryNote';
import dayjs from 'dayjs';
import Image from 'next/image';

export const DeliveryNoteHeader = ({
  deliveryNote,
  config,
}: {
  deliveryNote: DeliveryNote;
  config: SystemConfiguration;
}) => {
  const company = config.company;

  return (
    <div className="space-y-2 rounded-lg border border-gray-200 print:border-0 print:p-2">
      {/* Logo and Document Title */}
      <div className="flex justify-between items-end">
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

      {/* Company and Client Information */}
      <div className="grid grid-cols-2 gap-6">
        {/* Company Information */}
        <div className="p-4 bg-gray-50 rounded-lg flex flex-col h-60">
          {/* Altura fija */}
          <h2 className="text-sm font-semibold text-gray-800 mb-2 border-b bg-gray-50 border-gray-200">
            Informació de l'Empresa
          </h2>
          <div className="flex flex-col flex-grow justify-between bg-gray-50">
            {/* Primera sección: Nombre de la empresa */}
            <div>
              <p className="font-medium text-gray-900">{company.fiscalName}</p>
            </div>

            {/* Segunda sección: Dirección completa */}
            <div className="text-sm text-gray-700 space-y-1">
              <p className="line-clamp-2">{company.address.address}</p>
              <p>
                {company.address.postalCode}, {company.address.city}
              </p>
              <p>{company.address.province}</p>
            </div>

            {/* Tercera sección: NIF y contacto (alineado al bottom) */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                <span className="font-medium">NIF:</span> {company.nif}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Tel:</span> {company.phone}
              </p>
              <p className="text-sm text-gray-600 break-all">
                <span className="font-medium">Email:</span> {company.email}
              </p>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="p-4 bg-blue-50 rounded-lg flex flex-col h-60">
          {' '}
          {/* Ajusta la altura según necesites */}
          <h2 className="text-sm font-semibold text-gray-800 mb-2 border-b border-gray-200">
            Informació del Client
          </h2>
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
                <span className="font-medium shrink-0 mr-1">Adreça:</span>
                <span className="line-clamp-2">
                  {deliveryNote.customerAddress.address}
                </span>
              </p>
              <p>
                <span className="font-medium">CP:</span>{' '}
                {deliveryNote.customerAddress.postalCode},{' '}
                {deliveryNote.customerAddress.city}
              </p>
              <p>
                <span className="font-medium">Província:</span>{' '}
                {deliveryNote.customerAddress.province}
              </p>
            </div>

            {/* Tercera sección: NIF y contacto (alineado al bottom) */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                <span className="font-medium">NIF:</span>{' '}
                {deliveryNote.customerNif}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Tel:</span>{' '}
                {deliveryNote.customerPhone}
              </p>
              <p className="text-sm text-gray-600 break-all">
                <span className="font-medium">Email:</span>{' '}
                {deliveryNote.customerEmail}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Note Details */}
    </div>
  );
};
