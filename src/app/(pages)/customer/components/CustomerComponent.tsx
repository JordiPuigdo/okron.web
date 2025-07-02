import { HeaderTable } from 'components/layout/HeaderTable';

import { CustomerTable } from './CustomerTable';

export default function CustomerComponent() {
  return (
    <div className="flex flex-col h-full">
      <HeaderTable
        title="Clients"
        subtitle="Inici - Llistat de Client"
        createButton="Crear Client"
        urlCreateButton="/customer/new"
      />
      <CustomerTable />
    </div>
  );
}
