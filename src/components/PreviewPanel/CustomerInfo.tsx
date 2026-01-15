'use client';

import { MapPin, User } from 'lucide-react';

import { CustomerAddress } from '../../app/interfaces/Customer';

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerData {
  companyName?: string;
  customerNif?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: CustomerAddress;
  installation?: {
    code: string;
    address?: CustomerAddress;
  };
}

interface CustomerInfoProps {
  data: CustomerData;
  /** Contenido adicional a mostrar antes de la dirección */
  extraContent?: React.ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Componente reutilizable para mostrar información del cliente.
 * Principio SRP: Solo renderiza datos del cliente.
 * Principio OCP: Extensible via extraContent prop.
 */
export function CustomerInfo({ data, extraContent }: CustomerInfoProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <User className="w-5 h-5 text-gray-400 mt-0.5" />
        <div>
          <p className="font-medium text-gray-900">{data.companyName}</p>
          {data.customerNif && (
            <p className="text-sm text-gray-500">NIF: {data.customerNif}</p>
          )}
          {data.customerEmail && (
            <p className="text-sm text-gray-500">{data.customerEmail}</p>
          )}
          {data.customerPhone && (
            <p className="text-sm text-gray-500">{data.customerPhone}</p>
          )}
        </div>
      </div>

      {extraContent}

      {data.customerAddress && (
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
          <div className="text-sm text-gray-600">
            {data.customerAddress.address && (
              <p>{data.customerAddress.address}</p>
            )}
            {data.customerAddress.city && (
              <p>
                {data.customerAddress.postalCode} {data.customerAddress.city}
                {data.customerAddress.province &&
                  `, ${data.customerAddress.province}`}
              </p>
            )}
          </div>
        </div>
      )}

      {data.installation && (
        <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
          <MapPin className="w-5 h-5 text-[#6E41B6] mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#6E41B6]">Instal·lació</p>
            <p className="text-sm text-gray-700">{data.installation.code}</p>
            {data.installation.address?.address && (
              <p className="text-sm text-gray-500">
                {data.installation.address.address}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
