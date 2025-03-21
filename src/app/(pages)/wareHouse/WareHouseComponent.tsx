import { HeaderTable } from 'components/layout/HeaderTable';

import { TableDataWareHouse } from './TableDataWareHouse';

export default function WareHouseComponent() {
  return (
    <div className="flex flex-col h-full">
      <HeaderTable
        title="Magatzems"
        subtitle="Inici - Llistat de Magatzems"
        createButton="Crear Magatzem"
        urlCreateButton="/wareHouse/WareHouseForm"
      />
      <TableDataWareHouse />
    </div>
  );
}
