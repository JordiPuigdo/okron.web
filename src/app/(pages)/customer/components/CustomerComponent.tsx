import { HeaderTable } from 'components/layout/HeaderTable';

import { useTranslations } from '../../../hooks/useTranslations';
import { CustomerTable } from './CustomerTable';

export default function CustomerComponent() {
  const {t} = useTranslations();
  return (
    <div className="flex flex-col h-full">
      <HeaderTable
        title="Clients"
        subtitle={`${t('start')} - Llistat de Client`}
        createButton="Crear Client"
        urlCreateButton="/customer/new"
      />
      <CustomerTable />
    </div>
  );
}
