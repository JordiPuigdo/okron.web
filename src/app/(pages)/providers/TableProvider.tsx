'use client';
import { useEffect } from 'react';
import { useProviders } from 'app/hooks/useProviders';
import { useTranslations } from 'app/hooks/useTranslations';
import DataTable from 'components/table/DataTable';
import {
  Column,
  ColumnFormat,
  Filters,
  FiltersFormat,
  TableButtons,
} from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';

export const TableProvider = () => {
  const { t } = useTranslations();
  const { providers, fetchProviders } = useProviders(true);
  useEffect(() => {
    fetchProviders();
  }, []);

  return (
    <DataTable
      data={providers ?? []}
      columns={getColumnsProviders(t)}
      entity={EntityTable.PROVIDER}
      tableButtons={tableButtons}
      filters={getFiltersProviders(t)}
    />
  );
};
const tableButtons: TableButtons = {
  edit: true,
  detail: true,
};
const getColumnsProviders = (t: any): Column[] => [
  {
    label: t('common.id'),
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('nie'),
    key: 'nie',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('name'),
    key: 'name',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('email'),
    key: 'email',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('city'),
    key: 'city',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('address'),
    key: 'address',
    format: ColumnFormat.TEXT,
  },
];

const getFiltersProviders = (t: any): Filters[] => [
  {
    label: t('name'),
    key: 'name',
    format: FiltersFormat.TEXT,
  },
  {
    label: t('nie'),
    key: 'nie',
    format: FiltersFormat.TEXT,
  },
  {
    label: t('email'),
    key: 'email',
    format: FiltersFormat.TEXT,
  },
  {
    label: t('city'),
    key: 'city',
    format: FiltersFormat.TEXT,
  },
  {
    label: t('address'),
    key: 'address',
    format: FiltersFormat.TEXT,
  },
];
