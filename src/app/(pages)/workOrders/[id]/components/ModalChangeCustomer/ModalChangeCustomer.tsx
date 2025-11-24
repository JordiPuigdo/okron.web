'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCustomers } from 'app/hooks/useCustomers';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import { Customer, CustomerInstallations } from 'app/interfaces/Customer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from 'components/ui/dialog';
import { Button } from 'designSystem/Button/Buttons';

import { CustomerSection } from './CustomerSectionModal';
import { InstallationsSection } from './InstallationSectionModal';
import { SelectionSummary } from './SelectionSummary';
import {
  filterCustomers,
  filterInstallations,
  getCityOptions,
  sortBySelected,
  type TranslateFn,
} from './utils';

interface ModalChangeCustomerProps {
  open: boolean;
  currentCustomerId?: string;
  currentInstallationId?: string;
  onClose: () => void;
  onCustomerChanged?: (customerId: string, installationId: string) => void;
}

export const ModalChangeCustomer = ({
  open,
  currentCustomerId,
  currentInstallationId,
  onClose,
  onCustomerChanged,
}: ModalChangeCustomerProps) => {
  const { t } = useTranslations() as { t: TranslateFn };
  const { customers, loading, getInstallationsByCustomerId } = useCustomers();

  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    currentCustomerId ?? ''
  );
  const [selectedInstallationId, setSelectedInstallationId] = useState<
    string | undefined
  >(currentInstallationId);
  const [installations, setInstallations] = useState<CustomerInstallations[]>(
    []
  );
  const [loadingInstallations, setLoadingInstallations] = useState(false);
  const [installationSearch, setInstallationSearch] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSelectCustomer = async (
    customerId: string,
    installationId?: string
  ) => {
    setSelectedCustomerId(customerId);
    setSelectedInstallationId(installationId);
    setInstallationSearch('');
    setSelectedCityFilter('');
    setLoadingInstallations(true);

    try {
      const response = await getInstallationsByCustomerId(customerId);
      setInstallations(response ?? []);
    } finally {
      setLoadingInstallations(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedCustomerId) return;

    if (installations.length > 0 && !selectedInstallationId) return;
    setIsSaving(true);
    setError(undefined);

    try {
      onCustomerChanged?.(selectedCustomerId, selectedInstallationId ?? '');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unexpected.error'));
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (open && currentCustomerId) {
      void handleSelectCustomer(currentCustomerId, currentInstallationId);
    }
  }, [open, currentCustomerId, currentInstallationId]);

  const filteredCustomers = useMemo(
    () => filterCustomers(customers as Customer[], search),
    [customers, search]
  );

  const sortedCustomers = useMemo(
    () => sortBySelected(filteredCustomers, selectedCustomerId),
    [filteredCustomers, selectedCustomerId]
  );

  const cityOptions = useMemo(
    () => getCityOptions(installations),
    [installations]
  );

  const filteredInstallations = useMemo(
    () =>
      filterInstallations(
        installations,
        installationSearch,
        selectedCityFilter
      ),
    [installations, installationSearch, selectedCityFilter]
  );

  const sortedInstallations = useMemo(
    () => sortBySelected(filteredInstallations, selectedInstallationId),
    [filteredInstallations, selectedInstallationId]
  );

  const selectedCustomer = useMemo(
    () =>
      (customers as Customer[]).find(
        customer => customer.id === selectedCustomerId
      ) ?? null,
    [customers, selectedCustomerId]
  );

  const selectedInstallation = useMemo(
    () =>
      installations.find(
        installation => installation.id === selectedInstallationId
      ) ?? null,
    [installations, selectedInstallationId]
  );

  const hasSelectedCustomer = Boolean(selectedCustomerId);

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={value => !value && handleClose()}>
      <DialogContent className="bg-white max-w-3xl h-[58vh] flex flex-col">
        <DialogHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <DialogTitle className="text-xl font-semibold">
              {t('change.customer')}
            </DialogTitle>

            <SelectionSummary
              customer={selectedCustomer}
              installation={selectedInstallation}
              t={t}
            />
          </div>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-4 flex-1 overflow-hidden">
          <CustomerSection
            customers={sortedCustomers}
            loading={loading}
            search={search}
            selectedCustomerId={selectedCustomerId}
            onSearchChange={setSearch}
            onSelectCustomer={id => {
              void handleSelectCustomer(id);
            }}
            t={t}
          />

          <InstallationsSection
            installations={sortedInstallations}
            totalInstallations={installations.length}
            loading={loadingInstallations}
            hasSelectedCustomer={hasSelectedCustomer}
            search={installationSearch}
            onSearchChange={setInstallationSearch}
            cityOptions={cityOptions}
            selectedCity={selectedCityFilter}
            onCityChange={setSelectedCityFilter}
            selectedInstallationId={selectedInstallationId}
            onSelectInstallation={setSelectedInstallationId}
            t={t}
          />

          {error && <p className="text-sm text-red-600 flex-none">{error}</p>}

          <div className="flex justify-end gap-2 pt-2 border-t flex-none">
            <Button type="cancel" onClick={handleClose}>
              {t('cancel')}
            </Button>
            <Button
              type="create"
              disabled={
                !selectedCustomerId ||
                (installations.length > 0 && !selectedInstallationId) ||
                isSaving
              }
              isSubmit={false}
              onClick={handleConfirm}
            >
              {isSaving ? (
                // puedes reutilizar el spinner si quieres aquí también
                <span className="inline-flex items-center gap-2">
                  <SvgSpinner className="text-white w-4 h-4 animate-spin" />
                </span>
              ) : (
                t('confirm')
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
