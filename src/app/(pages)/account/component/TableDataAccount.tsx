'use client';

import { useEffect, useState } from 'react';
import { Account } from 'app/interfaces/Account';
import { AccountService } from 'app/services/accountService';
import DataTable from 'components/table/DataTable';
import {
  Column,
  ColumnFormat,
  Filters,
  FiltersFormat,
  TableButtons,
} from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';

export default function TableDataAccounts() {
  const acountService = new AccountService();
  const [accounts, setAccounts] = useState<Account[]>([]);
  useEffect(() => {
    async function fetchAccounts() {
      try {
        const Accounts = await acountService.getAll();
        setAccounts(Accounts);
      } catch (error) {
        console.error('Error fetching cost centers:', error);
      }
    }
    fetchAccounts();
  }, []);
  return (
    <DataTable
      data={accounts}
      columns={columnsOrders}
      entity={EntityTable.Account}
      tableButtons={tableButtons}
      filters={filtersOrders}
      hideShadow
    />
  );
}

const tableButtons: TableButtons = {
  edit: true,
  detail: true,
};
const columnsOrders: Column[] = [
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
    label: 'Descripció',
    key: 'description',
    format: ColumnFormat.TEXT,
  },
];

const filtersOrders: Filters[] = [
  {
    label: 'Codi',
    key: 'code',
    format: FiltersFormat.TEXT,
  },
  {
    label: 'Descripció',
    key: 'description',
    format: FiltersFormat.TEXT,
  },
];
