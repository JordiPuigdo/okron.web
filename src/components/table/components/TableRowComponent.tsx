import { memo, useCallback, useMemo } from 'react';
import { QueryParams, useQueryParams } from 'app/hooks/useFilters';
import { FilterValue } from 'app/types/filters';

import { Column, ColumnFormat } from '../interface/interfaceTable';
import { EntityTable } from '../interface/tableEntitys';
import { formatCellContent } from '../utils/TableUtils';
import { TableButtonsComponent } from './ButtonsTable/TableActions';

interface TableRowComponentProps {
  rowIndex: number;
  rowData: any;
  columns: Column[];
  handleSelectedRow: (id: string) => void;
  enableCheckbox: boolean;
  selectedRows: Set<string>;
  entity: EntityTable;
  isReport: boolean;
  tableButtons: any;
  loginUser: any;
  pathDetail: string;
  onDelete?: (id: string) => void;
  filtersApplied: FilterValue;
}

const TableRowComponent: React.FC<TableRowComponentProps> = ({
  rowIndex,
  rowData,
  columns,
  handleSelectedRow,
  enableCheckbox,
  selectedRows,
  entity,
  isReport,
  tableButtons,
  loginUser,
  pathDetail,
  onDelete,
  filtersApplied,
}) => {
  if (rowData.length === 0) return null;

  const { queryParams } = useQueryParams();

  const finalPath = useMemo(() => {
    const entityId = rowData[columns[0]?.key];
    if (!entityId) return '';

    const combinedParams: QueryParams = {
      ...filtersApplied,
      ...queryParams,
    };

    const paramsString = Object.keys(combinedParams)
      .filter(
        key => combinedParams[key] !== null && combinedParams[key] !== undefined
      )
      .map(key => {
        const value = combinedParams[key];
        if (Array.isArray(value)) {
          return value
            .map(
              v => `${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`
            )
            .join('&');
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(
          String(value)
        )}`;
      })
      .join('&');

    return `${entityId}${paramsString ? `?${paramsString}` : ''}`;
  }, [rowData, columns, filtersApplied, queryParams]);

  const filteredColumns = useMemo(
    () =>
      columns.filter(
        column =>
          column.key.toUpperCase() !== 'ID' &&
          column.label.toUpperCase() !== 'ID'
      ),
    [columns]
  );

  const handleRowClick = useCallback(() => {
    handleSelectedRow(rowData.id);
  }, [handleSelectedRow, rowData.id]);

  const isSelected = useMemo(
    () => selectedRows.has(rowData.id),
    [selectedRows, rowData.id]
  );

  return (
    <tr
      id={rowData.id}
      className={`${rowIndex % 2 === 0 ? '' : 'bg-gray-100'}`}
    >
      {enableCheckbox && (
        <td className="p-4 hover:cursor-pointer" onClick={handleRowClick}>
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleRowClick}
            />
          </div>
        </td>
      )}
      {filteredColumns.map(column => {
        const { value, classNametd, className } = formatCellContent(
          column,
          rowData,
          entity
        );

        const displayValue =
          column.format === ColumnFormat.BOOLEAN
            ? value
              ? 'Actiu'
              : 'Inactiu'
            : value;

        return (
          <td key={column.key} className={classNametd}>
            <label className={className}>{displayValue}</label>
          </td>
        );
      })}

      <TableButtonsComponent
        item={rowData}
        isReport={isReport}
        tableButtons={tableButtons}
        entity={entity}
        loginUser={loginUser}
        pathDetail={`${pathDetail}/${finalPath}`}
        onDelete={onDelete}
      />
    </tr>
  );
};

export default memo(TableRowComponent);
