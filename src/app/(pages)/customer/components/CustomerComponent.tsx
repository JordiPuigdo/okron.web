'use client';

import { HeaderTable } from 'components/layout/HeaderTable';

import { useTranslations } from '../../../hooks/useTranslations';
import { CustomerTable } from './CustomerTable';

export default function CustomerComponent() {
  const {t} = useTranslations();
  return (
    <div className="flex flex-col h-full">
      <HeaderTable
        title={t('customers')}
        subtitle={`${t('start')} - ${t('customer.list')}`}
        createButton={t('create.customer')}
        urlCreateButton="/customer/new"
      />
      <CustomerTable />
    </div>
  );
}
