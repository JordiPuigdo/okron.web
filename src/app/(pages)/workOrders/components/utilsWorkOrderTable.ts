import {
  Column,
  ColumnFormat,
} from 'components/table/interface/interfaceTable';

export const baseColumns: Column[] = [
  {
    label: 'ID',
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Num Sèrie',
    key: 'code',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Descripció',
    key: 'description',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Tipus',
    key: 'workOrderType',
    format: ColumnFormat.WORKORDERTYPE,
  },
  {
    label: 'Data Inici',
    key: 'startTime',
    format: ColumnFormat.DATETIME,
  },
  {
    label: 'Estat',
    key: 'stateWorkOrder',
    format: ColumnFormat.STATEWORKORDER,
  },
  {
    label: 'Equip',
    key: 'asset.description',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Original',
    key: 'originalWorkOrderCode',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Operaris',
    key: 'operatorsNames',
    format: ColumnFormat.TEXT,
    width: 'w-1/4',
  },
];

export const columnsTicket: Column[] = [
  {
    label: 'ID',
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Num Sèrie',
    key: 'code',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Descripció',
    key: 'description',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Tipus',
    key: 'workOrderType',
    format: ColumnFormat.WORKORDERTYPE,
  },
  {
    label: 'Data Inici',
    key: 'startTime',
    format: ColumnFormat.DATETIME,
  },
  {
    label: 'Estat',
    key: 'stateWorkOrder',
    format: ColumnFormat.STATEWORKORDER,
  },
  {
    label: 'Equip',
    key: 'asset.description',
    format: ColumnFormat.TEXT,
  },
];
