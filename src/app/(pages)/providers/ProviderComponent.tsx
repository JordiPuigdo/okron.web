'use client';
import { useTranslations } from 'app/hooks/useTranslations';
import { HeaderTable } from 'components/layout/HeaderTable';

import { TableProvider } from './TableProvider';

export default function ProviderComponent() {
  const {t} = useTranslations();
  return (
    <div className="flex flex-col h-full">
      <HeaderTable
        title={t('providers')}
        subtitle={`${t('start')} - ${t('providers.list')}`}
        createButton={t('create.provider')}
        urlCreateButton="/providers/ProviderForm"
      />
      <TableProvider />
    </div>
  );
}
