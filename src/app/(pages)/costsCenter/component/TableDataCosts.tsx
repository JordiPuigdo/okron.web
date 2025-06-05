'use client';

import { useEffect, useState } from 'react';
import { CostCenter } from 'app/interfaces/CostCenter';
import { CostService } from 'app/services/costService';
import DataTable from 'components/table/DataTable';
import {
  Column,
  ColumnFormat,
  Filters,
  FiltersFormat,
  TableButtons,
} from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';

export default function TableDataCosts() {
  const costsService = new CostService();
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  useEffect(() => {
    async function fetchCostCenters() {
      try {
        const costCenters = await costsService.getAll();
        setCostCenters(costCenters);
      } catch (error) {
        console.error('Error fetching cost centers:', error);
      }
    }
    fetchCostCenters();
  }, []);
  return (
    <DataTable
      data={costCenters}
      columns={columnsOrders}
      entity={EntityTable.COSTCENTER}
      tableButtons={tableButtons}
      filters={filtersOrders}
      hideShadow
    />
  );
}

const tableButtons: TableButtons = {
  edit: true,
  detail: true,
};
const columnsOrders: Column[] = [
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

const filtersOrders: Filters[] = [
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
