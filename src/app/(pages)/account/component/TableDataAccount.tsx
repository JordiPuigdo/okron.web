'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
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
  const { t } = useTranslations();
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
      columns={getColumnsOrders(t)}
      entity={EntityTable.Account}
      tableButtons={tableButtons}
      filters={getFiltersOrders(t)}
      hideShadow
    />
  );
}

const tableButtons: TableButtons = {
  edit: true,
  detail: true,
};
const getColumnsOrders = (t: any): Column[] => [
  {
    label: t('common.id'),
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('code'),
    key: 'code',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('description'),
    key: 'description',
    format: ColumnFormat.TEXT,
  },
];

const getFiltersOrders = (t: any): Filters[] => [
  {
    label: t('code'),
    key: 'code',
    format: FiltersFormat.TEXT,
  },
  {
    label: t('description'),
    key: 'description',
    format: FiltersFormat.TEXT,
  },
];
