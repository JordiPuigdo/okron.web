import { SparePartsConsumedsReport } from 'app/interfaces/SparePart';
import DataTable from 'components/table/DataTable';
import {
  Filters,
  FiltersFormat,
  TableButtons,
} from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';

import { columnsSparePartConsumedReport } from './columnsReport';

interface SparePartsConsumedReportTableProps {
  sparePartsConsumeds: SparePartsConsumedsReport[];
}
const tableButtons: TableButtons = {
  edit: false,
  delete: false,
  detail: false,
};
const filters: Filters[] = [
  {
    key: 'sparePartCode',
    label: 'Codi Recanvi',
    format: FiltersFormat.TEXT,
  },
  {
    key: 'sparePartDescription',
    label: 'Descripció Recanvi',
    format: FiltersFormat.TEXT,
  },
  {
    key: 'operator',
    label: 'Operari',
    format: FiltersFormat.TEXT,
  },
  {
    key: 'workOrderDescription',
    label: 'Descripció OT',
    format: FiltersFormat.TEXT,
  },
];
export default function SparePartsConsumedReportTable({
  sparePartsConsumeds,
}: SparePartsConsumedReportTableProps) {
  return (
    <DataTable
      columns={columnsSparePartConsumedReport}
      data={sparePartsConsumeds}
      tableButtons={tableButtons}
      entity={EntityTable.SPAREPART}
      filters={filters}
      onDelete={undefined}
      enableFilterActive={false}
      totalCounts={false}
      isReport={true}
    />
  );
}
