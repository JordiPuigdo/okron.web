import { HeaderTable } from 'components/layout/HeaderTable';

import { TableProvider } from './TableProvider';

export default function ProviderComponent() {
  return (
    <div className="flex flex-col h-full">
      <HeaderTable
        title="Proveïdors"
        subtitle="Inici - Llistat de Proveïdors"
        createButton="Crear Proveïdor"
        urlCreateButton="/providers/ProviderForm"
      />
      <TableProvider />
    </div>
  );
}
