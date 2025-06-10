import { HeaderTable } from 'components/layout/HeaderTable';

import TableDataAccounts from './TableDataAccount';

export default function AccountComponent() {
  return (
    <div className="flex flex-col h-full">
      <HeaderTable
        title="Compta Comptable"
        subtitle="Inici - Llistat de Comptes Comptables"
        createButton="Crear Compta Comptable"
        urlCreateButton="/account/accountForm"
      />
      <TableDataAccounts />
    </div>
  );
}
