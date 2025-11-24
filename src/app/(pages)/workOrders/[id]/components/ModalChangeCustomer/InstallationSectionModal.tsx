import { SvgSpinner } from 'app/icons/icons';
import type { CustomerInstallations } from 'app/interfaces/Customer';
import { Input } from 'components/ui/input';

import type { TranslateFn } from './utils';

interface InstallationsSectionProps {
  installations: CustomerInstallations[];
  totalInstallations: number;
  loading: boolean;
  hasSelectedCustomer: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  cityOptions: string[];
  selectedCity: string;
  onCityChange: (value: string) => void;
  selectedInstallationId?: string;
  onSelectInstallation: (id: string) => void;
  t: TranslateFn;
}

export const InstallationsSection = ({
  installations,
  totalInstallations,
  loading,
  hasSelectedCustomer,
  search,
  onSearchChange,
  cityOptions,
  selectedCity,
  onCityChange,
  selectedInstallationId,
  onSelectInstallation,
  t,
}: InstallationsSectionProps) => {
  return (
    <section className="border rounded-md p-3 space-y-3 h-72 flex flex-col">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between flex-none">
        <p className="text-sm font-semibold">
          {t('installations')} ({installations.length}/{totalInstallations})
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={search}
            onChange={event => onSearchChange(event.target.value)}
            placeholder={t('search.installations')}
            className="text-sm"
          />
          {cityOptions.length > 1 && (
            <select
              className="border rounded-md px-3 py-2 text-sm bg-white"
              value={selectedCity}
              onChange={event => onCityChange(event.target.value)}
            >
              <option value="">{t('all.cities')}</option>
              {cityOptions.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto border rounded-md divide-y mt-2">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-500 p-4">
            <SvgSpinner className="animate-spin w-4 h-4" />
            {t('loading.installations')}
          </div>
        )}

        {!loading && !hasSelectedCustomer && (
          <p className="p-4 text-sm text-gray-500">
            {t('no.installations.found')}
          </p>
        )}

        {!loading && hasSelectedCustomer && installations.length === 0 && (
          <p className="p-4 text-sm text-gray-500">
            {t('no.installations.found')}
          </p>
        )}

        {!loading &&
          installations.map(installation => {
            const isSelected = selectedInstallationId === installation.id;

            return (
              <button
                key={installation.id}
                type="button"
                className={`w-full text-left px-4 py-3 text-sm transition ${
                  isSelected
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onSelectInstallation(installation.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{installation.code}</p>

                  {isSelected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium px-2 py-0.5">
                      📌 {t('current.installation')}
                    </span>
                  )}
                </div>

                <p className="text-gray-600">
                  {installation.address.address}, {installation.address.city}
                </p>
              </button>
            );
          })}
      </div>
    </section>
  );
};
