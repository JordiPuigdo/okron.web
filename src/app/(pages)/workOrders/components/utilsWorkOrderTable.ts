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
    label: 'Data Creació',
    key: 'creationTime',
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

export const columnsCRM: Column[] = [
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
    label: 'Data Creació',
    key: 'creationTime',
    format: ColumnFormat.DATETIME,
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
    label: 'Client',
    key: 'customerWorkOrder.customerName',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Botiga',
    key: 'customerWorkOrder.customerInstallationAddress.city',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Codi',
    key: 'customerWorkOrder.customerInstallationCode',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Ref. Client',
    key: 'refCustomerId',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Operaris',
    key: 'operatorsNames',
    format: ColumnFormat.TEXT,
    width: 'w-1/4',
  },
];
