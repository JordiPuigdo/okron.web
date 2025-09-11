'use client';

import { SparePartsConsumedsReport } from 'app/interfaces/SparePart';
import { useTranslations } from 'app/hooks/useTranslations';
import DataTable from 'components/table/DataTable';
import {
  Filters,
  FiltersFormat,
  TableButtons,
} from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';

import { getColumnsSparePartConsumedReport } from './columnsReport';

interface SparePartsConsumedReportTableProps {
  sparePartsConsumeds: SparePartsConsumedsReport[];
}
const tableButtons: TableButtons = {
  edit: false,
  delete: false,
  detail: false,
};
const getFilters = (t: any): Filters[] => [
  {
    key: 'sparePartCode',
    label: t('spare.part.code'),
    format: FiltersFormat.TEXT,
  },
  {
    key: 'sparePartDescription',
    label: t('spare.part.description'),
    format: FiltersFormat.TEXT,
  },
  {
    key: 'operator',
    label: t('operator'),
    format: FiltersFormat.TEXT,
  },
  {
    key: 'workOrderDescription',
    label: t('work.order.description'),
    format: FiltersFormat.TEXT,
  },
];
export default function SparePartsConsumedReportTable({
  sparePartsConsumeds,
}: SparePartsConsumedReportTableProps) {
  const { t } = useTranslations();
  
  return (
    <DataTable
      columns={getColumnsSparePartConsumedReport(t)}
      data={sparePartsConsumeds}
      tableButtons={tableButtons}
      entity={EntityTable.SPAREPART}
      filters={getFilters(t)}
      onDelete={undefined}
      enableFilterActive={false}
      totalCounts={false}
      isReport={true}
    />
  );
}
