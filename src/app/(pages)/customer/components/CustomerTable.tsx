'use client';

import { useCustomers } from 'app/hooks/useCustomers';
import DataTable from 'components/table/DataTable';
import {
  Column,
  ColumnFormat,
} from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';

const columnsCustomers: Column[] = [
  {
    label: 'ID',
    key: 'id',
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
    label: 'Telèfon',
    key: 'phone',
    format: ColumnFormat.TEXT,
  },
];
export const tableButtons = {
  edit: true,
  detail: true,
};
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
      />
    </div>
  );
};
