export interface Column {
  label: string;
  key: string;
  format: ColumnFormat;
  width?: string;
  align?: string;
}

export interface Filters {
  label: string;
  key: string;
  format: FiltersFormat;
  value?: any;
}

export enum FiltersFormat {
  TEXT = 'TEXT',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
}

export interface TableButtons {
  edit?: boolean;
  delete?: boolean;
  detail?: boolean;
}

export enum ColumnFormat {
  ANY = 'ANY',
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  BOOLEAN = 'BOOLEAN',
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  WORKORDERTYPE = 'WORKORDERTYPE',
  STATEWORKORDER = 'STATEWORKORDER',
  KEY = 'KEY',
  OPERATORTYPE = 'OPERATORTYPE',
  STOCKMOVEMENTTYPE = 'STOCKMOVEMENTTYPE',
  ORDERSTATE = 'ORDERSTATE',
  PRICE = 'PRICE',
}

export enum ColumnnAlign {
  LEFT = 'LEFT',
  CENTER = 'CENTER',
  RIGHT = 'RIGHT',
}
