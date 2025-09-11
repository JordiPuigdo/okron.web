'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { useWareHouses } from 'app/hooks/useWareHouses';
import { WareHouse } from 'app/interfaces/WareHouse';
import DataTable from 'components/table/DataTable';
import {
  Column,
  ColumnFormat,
  Filters,
  FiltersFormat,
  TableButtons,
} from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';

export const TableDataWareHouse = () => {
  const { t } = useTranslations();
  const { warehouses, deleteWareHouse } = useWareHouses(true);
  const [filteredWarehouses, setFilteredWarehouses] = useState<
    WareHouse[] | undefined
  >(undefined);

  const columnsWareHouse = getColumns(t);
  const filtersWareHouse = getFilters(t);

  function onDelete(id: string) {
    if (filteredWarehouses) {
      deleteWareHouse(id);
      setFilteredWarehouses(prevWarehouses =>
        prevWarehouses!.filter(prevWarehouse => prevWarehouse.id !== id)
      );
    }
  }
  useEffect(() => {
    setFilteredWarehouses(warehouses);
  }, [warehouses]);

  return (
    <>
      {filteredWarehouses && filteredWarehouses.length > 0 && (
        <DataTable
          data={filteredWarehouses}
          columns={columnsWareHouse}
          entity={EntityTable.WAREHOUSE}
          tableButtons={tableButtons}
          filters={filtersWareHouse}
          onDelete={onDelete}
        />
      )}
    </>
  );
};

const tableButtons: TableButtons = {
  edit: true,
  detail: true,
  delete: true,
};
const getColumns = (t: any): Column[] => [
  {
    label: 'ID',
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('code'),
    key: 'code',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('description'),
    key: 'description',
    format: ColumnFormat.TEXT,
  },
];

const getFilters = (t: any): Filters[] => [
  {
    label: t('code'),
    key: 'code',
    format: FiltersFormat.TEXT,
  },
  {
    label: t('description'),
    key: 'description',
    format: FiltersFormat.TEXT,
  },
];
