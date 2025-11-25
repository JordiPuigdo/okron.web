import { SvgSpinner } from 'app/icons/icons';
import type { Customer } from 'app/interfaces/Customer';
import { Input } from 'components/ui/input';

import type { TranslateFn } from './utils';

interface CustomerSectionProps {
  customers: Customer[];
  loading: boolean;
  search: string;
  selectedCustomerId?: string;
  onSearchChange: (value: string) => void;
  onSelectCustomer: (id: string) => void;
  t: TranslateFn;
}

export const CustomerSection = ({
  customers,
  loading,
  search,
  selectedCustomerId,
  onSearchChange,
  onSelectCustomer,
  t,
}: CustomerSectionProps) => {
  return (
    <section className="flex flex-col gap-2">
      <Input
        placeholder={t('search.customer')}
        value={search}
        onChange={event => onSearchChange(event.target.value)}
      />

      <div className="border rounded-md h-60 flex flex-col">
        <div className="flex-1 overflow-y-auto divide-y">
          {loading && (
            <div className="flex items-center justify-center py-6 gap-2 text-sm text-gray-500">
              <SvgSpinner className="animate-spin w-4 h-4" />
              {t('loading.data')}
            </div>
          )}

          {!loading && customers.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">
              {t('no.results')}
            </p>
          )}

          {!loading &&
            customers.map(customer => {
              const isSelected = selectedCustomerId === customer.id;

              return (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => onSelectCustomer(customer.id)}
                  className={`w-full text-left px-4 py-3 transition flex flex-col ${
                    isSelected
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{customer.name}</p>

                    {isSelected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium px-2 py-0.5">
                        📌 {t('current.customer')}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500">
                    {customer.code} · {customer.taxId || t('no.taxId')}
                  </p>
                </button>
              );
            })}
        </div>
      </div>
    </section>
  );
};
