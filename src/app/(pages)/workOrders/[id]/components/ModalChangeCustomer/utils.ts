// utils.ts
import type { Customer, CustomerInstallations } from 'app/interfaces/Customer';

export type TranslateFn = (key: string) => string;

const normalize = (value: string): string => value.trim().toLowerCase();

export const filterCustomers = (
  customers: Customer[],
  search: string
): Customer[] => {
  const term = normalize(search);
  if (!term) return customers;

  return customers.filter(customer => {
    const haystack = `${customer.name} ${customer.code} ${
      customer.taxId ?? ''
    }`.toLowerCase();
    return haystack.includes(term);
  });
};

export const sortBySelected = <T extends { id: string }>(
  items: T[],
  selectedId?: string
): T[] => {
  if (!items.length || !selectedId) return items;

  const selected = items.find(item => item.id === selectedId);
  if (!selected) return items;

  const rest = items.filter(item => item.id !== selectedId);
  return [selected, ...rest];
};

export const getCityOptions = (
  installations: CustomerInstallations[]
): string[] => {
  const cities = installations
    .map(installation => installation.address.city)
    .filter((city): city is string => Boolean(city));

  return Array.from(new Set(cities));
};

export const filterInstallations = (
  installations: CustomerInstallations[],
  search: string,
  selectedCity: string
): CustomerInstallations[] => {
  const term = normalize(search);

  return installations.filter(installation => {
    const matchesCity =
      selectedCity === '' || installation.address.city === selectedCity;

    if (!matchesCity) return false;
    if (!term) return true;

    const haystack =
      `${installation.code} ${installation.address.address} ${installation.address.city}`.toLowerCase();
    return haystack.includes(term);
  });
};
