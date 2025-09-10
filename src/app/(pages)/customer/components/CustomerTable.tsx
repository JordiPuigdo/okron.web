'use client';

import { useCustomers } from 'app/hooks/useCustomers';
import { useTranslations } from 'app/hooks/useTranslations';
import DataTable from 'components/table/DataTable';
import {
  Column,
  ColumnFormat,
  Filters,
  FiltersFormat,
} from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';

const getColumnsCustomers = (t: any): Column[] => [
  {
    label: 'ID',
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('code'),
    key: 'code',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('name'),
    key: 'name',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('fiscal.name'),
    key: 'fiscalName',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('tax.id'),
    key: 'taxId',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('phone'),
    key: 'phoneNumber',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('whatsapp'),
    key: 'whatsappNumber',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('active'),
    key: 'active',
    format: ColumnFormat.BOOLEAN,
  },
];
export const tableButtons = {
  edit: true,
  detail: true,
};

const getFilterCustomer = (t: any): Filters[] => [
  {
    label: t('code'),
    key: 'code',
    format: FiltersFormat.TEXT,
  },
  {
    label: t('name'),
    key: 'name',
    format: FiltersFormat.TEXT,
  },
  {
    label: t('fiscal.name'),
    key: 'fiscalName',
    format: FiltersFormat.TEXT,
  },
  {
    label: t('phone'),
    key: 'phoneNumber',
    format: FiltersFormat.TEXT,
  },
  {
    label: t('tax.id'),
    key: 'taxId',
    format: FiltersFormat.TEXT,
  },
];

export const CustomerTable = () => {
  const { t } = useTranslations();
  const { customers, loading, error } = useCustomers();

  if (loading) return <div>{t('loading.customers')}</div>;
  if (error) return <div className="text-red-500">{t('error')}: {error}</div>;

  return (
    <div className="w-full">
      <DataTable
        data={customers}
        columns={getColumnsCustomers(t)}
        entity={EntityTable.CUSTOMER}
        tableButtons={tableButtons}
        hideShadow={false}
        filters={getFilterCustomer(t)}
      />
    </div>
  );
};
