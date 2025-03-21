import {
  Column,
  ColumnFormat,
} from "components/table/interface/interfaceTable";

export const columnsSparePartConsumedReport: Column[] = [
  {
    label: "sparePartId",
    key: "id",
    format: ColumnFormat.TEXT,
  },
  {
    label: "Codi Recanvi",
    key: "sparePartCode",
    format: ColumnFormat.TEXT,
  },
  {
    label: "Descripció Recanvi",
    key: "sparePartDescription",
    format: ColumnFormat.TEXT,
  },
  {
    label: "Quantitat",
    key: "sparePartNumber",
    format: ColumnFormat.NUMBER,
  },
  {
    label: "Data",
    key: "date",
    format: ColumnFormat.DATETIME,
  },
  {
    label: "Codi OT",
    key: "workOrderCode",
    format: ColumnFormat.TEXT,
  },
  {
    label: "Descripció OT",
    key: "workOrderDescription",
    format: ColumnFormat.TEXT,
  },
  {
    label: "Operari",
    key: "operator",
    format: ColumnFormat.TEXT,
  },
];
