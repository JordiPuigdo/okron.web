'use client';
import { useEffect } from 'react';
import { useProviders } from 'app/hooks/useProviders';
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
  const { providers, fetchProviders } = useProviders(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  return (
    <DataTable
      data={providers ?? []}
      columns={columnsProviders}
      entity={EntityTable.PROVIDER}
      tableButtons={tableButtons}
      filters={filters}
    />
  );
};
const tableButtons: TableButtons = {
  edit: true,
  detail: true,
};
const columnsProviders: Column[] = [
  {
    label: 'ID',
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'NIE',
    key: 'nie',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Nom',
    key: 'name',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Email',
    key: 'email',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Ciutat',
    key: 'city',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Adreça',
    key: 'address',
    format: ColumnFormat.TEXT,
  },
];

const filters: Filters[] = [
  {
    label: 'Nom',
    key: 'name',
    format: FiltersFormat.TEXT,
  },
  {
    label: 'NIE',
    key: 'nie',
    format: FiltersFormat.TEXT,
  },
  {
    label: 'Email',
    key: 'email',
    format: FiltersFormat.TEXT,
  },
  {
    label: 'Ciutat',
    key: 'city',
    format: FiltersFormat.TEXT,
  },
  {
    label: 'Adreça',
    key: 'address',
    format: FiltersFormat.TEXT,
  },
];
