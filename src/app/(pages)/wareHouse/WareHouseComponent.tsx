'use client';
import { HeaderTable } from 'components/layout/HeaderTable';

import { useTranslations } from '../../hooks/useTranslations';
import { TableDataWareHouse } from './TableDataWareHouse';

export default function WareHouseComponent() {
  const {t} = useTranslations();
  return (
    <div className="flex flex-col h-full">
      <HeaderTable
        title={t('sidebar.warehouse')}
        subtitle={t('warehouse.listTitle')}
        createButton={t('warehouse.createWarehouse')}
        urlCreateButton="/wareHouse/WareHouseForm"
      />
      <TableDataWareHouse />
    </div>
  );
}
