'use client';

import { ProviderInfoProps } from './types';

/**
 * Información del proveedor.
 * SRP: Solo muestra datos del proveedor.
 */
export function ProviderInfo({ provider, providerName }: ProviderInfoProps) {
  if (!provider && !providerName) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-900">
          {provider?.name || providerName || '-'}
        </span>
      </div>

      {provider && (
        <>
          {provider.nie && (
            <p className="text-sm text-gray-600">NIF/NIE: {provider.nie}</p>
          )}
          {provider.email && (
            <p className="text-sm text-gray-600">Email: {provider.email}</p>
          )}
          {provider.phoneNumber && (
            <p className="text-sm text-gray-600">Tel: {provider.phoneNumber}</p>
          )}
        </>
      )}
    </div>
  );
}
