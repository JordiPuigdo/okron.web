import {
  Column,
  ColumnFormat,
} from "components/table/interface/interfaceTable";

export const getColumnsSparePartConsumedReport = (t: any): Column[] => [
  {
    label: t('spare.part.id'),
    key: "id",
    format: ColumnFormat.TEXT,
  },
  {
    label: t('spare.part.code'),
    key: "sparePartCode",
    format: ColumnFormat.TEXT,
  },
  {
    label: t('spare.part.description'),
    key: "sparePartDescription",
    format: ColumnFormat.TEXT,
  },
  {
    label: t('quantity'),
    key: "sparePartNumber",
    format: ColumnFormat.NUMBER,
  },
  {
    label: t('date'),
    key: "date",
    format: ColumnFormat.DATETIME,
  },
  {
    label: t('work.order.code'),
    key: "workOrderCode",
    format: ColumnFormat.TEXT,
  },
  {
    label: t('work.order.description'),
    key: "workOrderDescription",
    format: ColumnFormat.TEXT,
  },
  {
    label: t('operator'),
    key: "operator",
    format: ColumnFormat.TEXT,
  },
];
