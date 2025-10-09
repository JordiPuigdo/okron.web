import {
  Column,
  ColumnFormat,
} from 'components/table/interface/interfaceTable';

export const getBaseColumns = (t: any): Column[] => [
  {
    label: t('common.id'),
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('workorder.serial.number'),
    key: 'code',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('common.description'),
    key: 'description',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('workorder.type'),
    key: 'workOrderType',
    format: ColumnFormat.WORKORDERTYPE,
  },
  {
    label: t('workorder.creation.date'),
    key: 'creationTime',
    format: ColumnFormat.DATETIME,
  },
  {
    label: t('workorder.state'),
    key: 'stateWorkOrder',
    format: ColumnFormat.STATEWORKORDER,
  },
  {
    label: t('workorder.equipment'),
    key: 'asset.description',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('workorder.original'),
    key: 'originalWorkOrderCode',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('workorder.operators'),
    key: 'operatorsNames',
    format: ColumnFormat.TEXT,
    width: 'w-1/4',
  },
];

export const getColumnsTicket = (t: any): Column[] => [
  {
    label: t('common.id'),
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('workorder.serial.number'),
    key: 'code',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('common.description'),
    key: 'description',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('workorder.type'),
    key: 'workOrderType',
    format: ColumnFormat.WORKORDERTYPE,
  },
  {
    label: t('workorder.start.date'),
    key: 'startTime',
    format: ColumnFormat.DATETIME,
  },
  {
    label: t('workorder.state'),
    key: 'stateWorkOrder',
    format: ColumnFormat.STATEWORKORDER,
  },
  {
    label: t('workorder.equipment'),
    key: 'asset.description',
    format: ColumnFormat.TEXT,
  },
];

export const getColumnsCRM = (t: any): Column[] => [
  {
    label: t('common.id'),
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('workorder.serial.number'),
    key: 'code',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('common.description'),
    key: 'description',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('workorder.type'),
    key: 'workOrderType',
    format: ColumnFormat.WORKORDERTYPE,
  },
  {
    label: t('workorder.creation.date'),
    key: 'creationTime',
    format: ColumnFormat.DATETIME,
  },
  {
    label: t('workorder.start.date'),
    key: 'startTime',
    format: ColumnFormat.DATETIME,
  },
  {
    label: t('workorder.state'),
    key: 'stateWorkOrder',
    format: ColumnFormat.STATEWORKORDER,
  },
  {
    label: t('customer.customer'),
    key: 'customerWorkOrder.customerName',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('customer.store'),
    key: 'customerWorkOrder.customerInstallationAddress.city',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('common.code'),
    key: 'customerWorkOrder.customerInstallationCode',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('customer.reference'),
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
