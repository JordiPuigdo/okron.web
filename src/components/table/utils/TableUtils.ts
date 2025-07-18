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

export const sortData = (
  data: any[],
  sortColumn: string,
  sortOrder: 'ASC' | 'DESC'
): any[] => {
  return data.sort((a: any, b: any) => {
    if (!a.hasOwnProperty(sortColumn) || !b.hasOwnProperty(sortColumn)) {
      return 0;
    }

    let aValue = a[sortColumn];
    let bValue = b[sortColumn];

    // Try converting to numbers if they look like numbers
    const aNum = parseFloat(aValue);
    const bNum = parseFloat(bValue);
    const aIsNumeric = !isNaN(aNum);
    const bIsNumeric = !isNaN(bNum);

    if (aIsNumeric && bIsNumeric) {
      aValue = aNum;
      bValue = bNum;
    }

    if (aValue < bValue) return sortOrder === 'ASC' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'ASC' ? 1 : -1;
    return 0;
  });
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
    className = ' justify-end text-end';
    value = value.toFixed(2) + '€';
  }

  if (column.format === ColumnFormat.STOCKMOVEMENTTYPE) {
    className = getStatusClassName(value, 'STOCKMOVEMENT');
    console.log(value);
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

  if (column.align === ColumnnAlign.RIGHT) classNametd += ' text-right pr-8';
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

export const calculateTotalAmountRecords = (data: any[]) => {
  if (EntityTable.ORDER && data.length > 0) {
    const x = data.reduce((acc, order) => {
      return acc + (order.totalAmount ?? 0);
    }, 0);

    const formattedNumber = new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(x);

    return formattedNumber;
  } else {
    return undefined;
  }
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
