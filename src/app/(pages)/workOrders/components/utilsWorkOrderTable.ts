import {
  Column,
  ColumnFormat,
} from 'components/table/interface/interfaceTable';

const getCommonColumns = (t: any): Column[] => [
  {
    label: t('common.id'),
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('workorder.serial.number'),
    key: 'code',
    format: ColumnFormat.WORKORDERCODE,
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
];

export const getBaseColumns = (t: any): Column[] => [
  ...getCommonColumns(t),
  {
    label: t('workorder.equipment'),
    key: 'assetDescription',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('brand'),
    key: 'assetBrand',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('workorder.relatedWorkOrder'),
    key: 'relatedWorkOrder',
    format: ColumnFormat.RELATEDWORKORDER,
  },
  {
    label: t('workorder.operators'),
    key: 'operatorsNames',
    format: ColumnFormat.TEXT,
    width: 'w-1/4',
  },
];

export const getColumnsTicket = (t: any): Column[] => [
  ...getCommonColumns(t),
  {
    label: t('workorder.start.date'),
    key: 'startTime',
    format: ColumnFormat.DATETIME,
  },
  {
    label: t('workorder.equipment'),
    key: 'assetDescription',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('workorder.relatedWorkOrder'),
    key: 'relatedWorkOrder',
    format: ColumnFormat.RELATEDWORKORDER,
  },
];

export const getColumnsCRM = (t: any): Column[] => [
  ...getCommonColumns(t),
  {
    label: t('workorder.start.date'),
    key: 'startTime',
    format: ColumnFormat.DATETIME,
  },
  {
    label: t('customer.customer'),
    key: 'customerName',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('customer.store'),
    key: 'customerInstallationCity',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('common.code'),
    key: 'customerInstallationCode',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('customer.reference'),
    key: 'refCustomerId',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('workorder.operators'),
    key: 'operatorsNames',
    format: ColumnFormat.TEXT,
    width: 'w-1/4',
  },
];
