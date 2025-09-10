import { useTranslations } from 'app/hooks/useTranslations';
import { HeaderTable } from 'components/layout/HeaderTable';

import { TableProvider } from './TableProvider';

export default function ProviderComponent() {
  const {t} = useTranslations();
  return (
    <div className="flex flex-col h-full">
      <HeaderTable
        title="Proveïdors"
        subtitle={`${t('start')} - Llistat de Proveïdors`}
        createButton="Crear Proveïdor"
        urlCreateButton="/providers/ProviderForm"
      />
      <TableProvider />
    </div>
  );
}
