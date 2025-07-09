'use client';

import { useCustomers } from 'app/hooks/useCustomers';
import DataTable from 'components/table/DataTable';
import {
  Column,
  ColumnFormat,
  Filters,
  FiltersFormat,
} from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';

const columnsCustomers: Column[] = [
  {
    label: 'ID',
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Codi',
    key: 'code',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Nom',
    key: 'name',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'NIF/CIF',
    key: 'taxId',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Telèfon',
    key: 'phoneNumber',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Whtasapp',
    key: 'whatsappNumber',
    format: ColumnFormat.TEXT,
  },
];
export const tableButtons = {
  edit: true,
  detail: true,
};

const filterCustomer: Filters[] = [
  {
    label: 'Codi',
    key: 'code',
    format: FiltersFormat.TEXT,
  },
  {
    label: 'Nom',
    key: 'name',
    format: FiltersFormat.TEXT,
  },
  {
    label: 'Telèfon',
    key: 'phoneNumber',
    format: FiltersFormat.TEXT,
  },
  {
    label: 'NIF/CIF',
    key: 'taxId',
    format: FiltersFormat.TEXT,
  },
];

export const CustomerTable = () => {
  const { customers, loading, error } = useCustomers();

  if (loading) return <div>Carregant clients...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="w-full">
      <DataTable
        data={customers}
        columns={columnsCustomers}
        entity={EntityTable.CUSTOMER}
        tableButtons={tableButtons}
        hideShadow={false}
        filters={filterCustomer}
      />
    </div>
  );
};
