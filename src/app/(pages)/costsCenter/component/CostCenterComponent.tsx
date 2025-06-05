import { HeaderTable } from 'components/layout/HeaderTable';

import TableDataCosts from './TableDataCosts';

export default function CostCenterComponent() {
  return (
    <div className="flex flex-col h-full">
      <HeaderTable
        title="Centre de Costs"
        subtitle="Inici - Llistat de Centres de Costs"
        createButton="Crear Centre de Costs"
        urlCreateButton="/costsCenter/costsCenterForm"
      />
      <TableDataCosts />
    </div>
  );
}
