import {
  formatDate,
  translateOperatorType,
  translateStateWorkOrder,
  translateWorkOrderType,
} from 'app/utils/utils';
import * as XLSX from 'xlsx';

import { entityStatusConfig } from '../interface/EntityStatusConfig';
import {
  Column,
  ColumnFormat,
  ColumnnAlign,
} from '../interface/interfaceTable';
import { EntityTable } from '../interface/tableEntitys';

export function onDelete(id: string, entity: EntityTable) {
  const confirm = window.confirm('Segur que voleu eliminar aquest registre?');
  if (!confirm) return;

  switch (entity) {
    case EntityTable.WORKORDER:
      break;
    case EntityTable.ASSET:
      break;
    case EntityTable.MACHINE:
      break;
    case EntityTable.SECTION:
      break;
    case EntityTable.OPERATOR:
      break;
    case EntityTable.PREVENTIVE:
      break;
    case EntityTable.INSPECTIONPOINTS:
      break;
    case EntityTable.SPAREPART:
      break;
    default:
      break;
  }
}

// function delteAssset(id: string) {
//   const assetService = new AssetService(process.env.NEXT_PUBLIC_API_BASE_URL!);
//   assetService
//     .deleteAsset(id)
//     .then((data) => {
//       if (data) {
//         window.location.reload();
//       }
//     })
//     .catch((error) => {
//       console.error("Error al eliminar activo:", error);
//       setMessage("Error al eliminar activo");
//       setTimeout(() => {
//         setMessage("");
//       }, 3000);
//     });
// }

export const getNestedFieldValue = (rowData: any, key: string) => {
  const keys = key.split('.');
  let value = rowData;
  for (const k of keys) {
    if (Array.isArray(value)) {
      value = value[0];
    }
    if (value && Object.prototype.hasOwnProperty.call(value, k)) {
      value = value[k];
    } else {
      return '';
    }
  }
  return value;
};

export const sortData = <T extends Record<string, any>>(
  data: T[],
  sortColumn: keyof T,
  sortOrder: 'ASC' | 'DESC'
): T[] => {
  return [...data].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    // Convert to comparable values
    const aComparable = getComparableValue(aValue);
    const bComparable = getComparableValue(bValue);

    const comparison =
      aComparable < bComparable ? -1 : aComparable > bComparable ? 1 : 0;
    return sortOrder === 'ASC' ? comparison : -comparison;
  });
};

const getComparableValue = (value: any): number | string => {
  if (value == null) return '';
  if (value instanceof Date) return value.getTime();

  const num = typeof value === 'number' ? value : parseFloat(value);
  if (!isNaN(num) && typeof value !== 'boolean') return num;

  return String(value);
};

export const filterByActiveStatus = (record: any, filterActive: boolean) =>
  typeof record === 'object' &&
  record.hasOwnProperty('active') &&
  (!filterActive || record.active);
export const filterByUnderStock = (record: any) =>
  typeof record === 'object' &&
  record.hasOwnProperty('minium') &&
  record.minium < record.stock;

export const formatCellContent = (
  column: Column,
  rowData: any,
  entity: string
) => {
  let value = getNestedFieldValue(rowData, column.key);
  let classNametd = 'p-4';
  let className = 'font-normal';

  if (column.format === ColumnFormat.DATE)
    value = formatDate(value, false, false);
  if (column.format === ColumnFormat.DATETIME) value = formatDate(value);
  if (column.format === ColumnFormat.WORKORDERTYPE) {
    className = getStatusClassName(value, entity);
    value = translateWorkOrderType(value);
  }
  if (column.format === ColumnFormat.STATEWORKORDER) {
    className = getStatusClassName(value, 'WORKORDERSTATE');
    value = translateStateWorkOrder(value);
  }
  if (column.format === ColumnFormat.ORDERSTATE) {
    className = getStatusClassName(value, 'ORDER');
    value = getStatusText(value, 'ORDER');
  }
  if (column.format === ColumnFormat.PRICE) {
    className = 'justify-end text-end';
    const numericValue = value ?? 0;

    if (typeof numericValue === 'number') {
      value = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericValue);
    } else {
      value = '0,00€';
    }
  }
  if (column.format == ColumnFormat.INVOICESTATUS) {
    className = getStatusClassName(value, 'INVOICE');
    value = getStatusText(value, 'INVOICE');
  }

  if (column.format === ColumnFormat.DELIVERYNOTESTATUS) {
    className = getStatusClassName(value, 'DELIVERYNOTE');
    value = getStatusText(value, 'DELIVERYNOTE');
  }

  if (column.format === ColumnFormat.STOCKMOVEMENTTYPE) {
    className = getStatusClassName(value, 'STOCKMOVEMENT');
    value = getStatusText(value, 'STOCKMOVEMENT');
  }

  if (column.format === ColumnFormat.OPERATORTYPE) {
    className = getStatusClassName(value, entity);
    value = translateOperatorType(value);
  }

  if (column.key === 'active') {
    className += ' w-full';
    className += value
      ? ' bg-green-500 p-2 rounded-xl text-white'
      : ' bg-red-500 p-2 rounded-xl text-white';
  }

  if (column.className) className += ` ${column.className}`;

  if (column.align === ColumnnAlign.RIGHT) {
    classNametd += ' text-right pr-8';
  }
  if (rowData.colorRow) classNametd += ` ${rowData.colorRow}`;

  if (value && value.length > 100) value = value.substring(0, 50) + '...';

  return { value, classNametd, className };
};

export function getStatusText(statusText: string, entity: string): string {
  const lowercaseStatus = statusText;

  const config = entityStatusConfig[entity];

  if (config && lowercaseStatus in config.names) {
    return config.names[lowercaseStatus];
  }
  return statusText;
}

export const getStatusClassName = (status: string, entity: string): string => {
  const uppercaseStatus = status.toString().toUpperCase();
  const config = entityStatusConfig[entity];
  if (config && uppercaseStatus in config.colors) {
    const style = config.colors[uppercaseStatus];
    return ` text-white rounded-full p-1 text-sm flex justify-center text-center  ${style}`;
  }
  return '';
};

const validColumns = [ColumnFormat.DATE, ColumnFormat.DATETIME];

export const calculateTotalAmountByEntity = (
  data: any[],
  entity: EntityTable
): string | undefined => {
  if (!data || data.length === 0) return undefined;

  const total = data.reduce((acc, item) => {
    if (entity === EntityTable.SPAREPART) {
      const price = Number(item.price) || 0;
      const stock = Number(item.stock) || 0;
      const totalItem = Number(item.total) || 0;
      return acc + (price > 0 && stock > 0 ? price * stock : totalItem);
    } else if (entity === EntityTable.ORDER) {
      const totalItem =
        typeof item.totalAmount === 'string'
          ? Number(item.totalAmount.replace('.', '').replace(',', '.'))
          : Number(item.totalAmount) || 0;
      return acc + totalItem;
    } else {
      return acc + (Number(item.total) || 0);
    }
  }, 0);

  if (entity === EntityTable.ORDER) {
    // Convertimos a string con 2 decimales
    const [integerPart, decimalPart] = total.toFixed(2).split('.');

    // Insertamos puntos cada 3 cifras
    const integerPart2 = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${integerPart2},${decimalPart}€`;
  }

  // Para SPAREPART u otras entidades, puedes usar Intl.NumberFormat
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(total);
};

export const exportTableToExcel = (
  data: any[],
  columns: Column[],
  filename: string,
  footerData?: Record<string, any>
) => {
  const filteredColumns = columns.filter(
    col =>
      col.label.toLocaleUpperCase() !== 'ID' &&
      col.label.toLocaleUpperCase() !== 'ACTIU' &&
      col.label.toLocaleUpperCase() !== 'SPAREPARTID'
  );

  const headers = filteredColumns.map(col => col.label);

  const rows = data.map(row =>
    filteredColumns.map(col => {
      const cellValue = row[col.key];

      return validColumns.includes(col.format)
        ? formatDate(cellValue)
        : cellValue;
    })
  );

  const worksheetData = [headers, ...rows];

  if (footerData) {
    const footerRow = filteredColumns.map(col => footerData[col.key] ?? '');
    worksheetData.push(footerRow);
  }

  // Step 3: Create worksheet and workbook
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Step 4: Export to Excel
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
