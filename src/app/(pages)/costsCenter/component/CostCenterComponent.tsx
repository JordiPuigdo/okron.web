import { HeaderTable } from 'components/layout/HeaderTable';

import TableDataCosts from './TableDataCosts';

export default function CostCenterComponent() {
  return (
    <div className="flex flex-col h-full">
      <HeaderTable
        title="Compta Comptable"
        subtitle="Inici - Llistat de Centres de Costs"
        createButton="Crear Compta Comptable"
        urlCreateButton="/costsCenter/costsCenterForm"
      />
      <TableDataCosts />
    </div>
  );
}
