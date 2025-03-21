'use client';
import { useEffect, useState } from 'react';
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
  const { warehouses, deleteWareHouse } = useWareHouses(true);
  const [filteredWarehouses, setFilteredWarehouses] = useState<
    WareHouse[] | undefined
  >(undefined);

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
const columnsWareHouse: Column[] = [
  {
    label: 'ID',
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Codi',
    key: 'code',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Descripció',
    key: 'description',
    format: ColumnFormat.TEXT,
  },
];

const filtersWareHouse: Filters[] = [
  {
    label: 'Codi',
    key: 'code',
    format: FiltersFormat.TEXT,
  },
  {
    label: 'Descripció',
    key: 'description',
    format: FiltersFormat.TEXT,
  },
];
