'use client';

import { HeaderTable } from 'components/layout/HeaderTable';

import { useTranslations } from '../../../hooks/useTranslations';
import TableDataAccounts from './TableDataAccount';

export default function AccountComponent() {
  const {t} = useTranslations();
  return (
    <div className="flex flex-col h-full">
      <HeaderTable
        title={t('accounting.account')}
        subtitle={`${t('start')} - ${t('accounting.accounts.list')}`}
        createButton={t('create.accounting.account')}
        urlCreateButton="/account/accountForm"
      />
      <TableDataAccounts />
    </div>
  );
}
