import type { Customer, CustomerInstallations } from 'app/interfaces/Customer';

import type { TranslateFn } from './utils';

interface SelectionSummaryProps {
  customer: Customer | null;
  installation: CustomerInstallations | null;
  t: TranslateFn;
}

export const SelectionSummary = ({
  customer,
  installation,
  t,
}: SelectionSummaryProps) => {
  if (!customer && !installation) return null;

  return (
    <div className="rounded-md border bg-gray-50 px-3 py-2 text-xs text-gray-700 space-y-1 max-w-xs sm:max-w-sm">
      {customer && (
        <p className="truncate">
          <span className="font-semibold">{t('current.customer')}:</span>{' '}
          <span title={customer.name}>{customer.name}</span>{' '}
          <span className="text-gray-500">({customer.code})</span>
        </p>
      )}

      {installation && (
        <p className="truncate">
          <span className="font-semibold">{t('current.installation')}:</span>{' '}
          <span title={installation.code}>{installation.code}</span>
          {installation.address?.city && (
            <span className="text-gray-500">
              {' '}
              · {installation.address.city}
            </span>
          )}
        </p>
      )}
    </div>
  );
};
