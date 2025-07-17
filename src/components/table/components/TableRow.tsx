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

export const TableRowComponent: React.FC<TableRowComponentProps> = ({
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
  if (rowData.length == 0) return null;

  let finalPath = pathDetail;

  return (
    <tr
      id={rowData.id}
      className={`${rowIndex % 2 === 0 ? '' : 'bg-gray-100'}`}
    >
      {enableCheckbox && (
        <td
          className="p-4 hover:cursor-pointer"
          onClick={() => handleSelectedRow(rowData.id)}
        >
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={selectedRows.has(rowData.id)}
              onChange={() => handleSelectedRow(rowData.id)}
            />
          </div>
        </td>
      )}
      {columns
        .filter(
          column =>
            column.key.toLocaleUpperCase() !== 'ID' &&
            column.label.toLocaleUpperCase() !== 'ID'
        )
        .map(column => {
          const { value, classNametd, className } = formatCellContent(
            column,
            rowData,
            entity
          );

          if (value === 'Consum') {
            finalPath = `/workOrders/`;
          }
          return (
            <td key={column.key} className={classNametd}>
              <label className={className}>
                {column.format === ColumnFormat.BOOLEAN
                  ? value
                    ? 'Actiu'
                    : 'Inactiu'
                  : value}
              </label>
            </td>
          );
        })}
      <TableButtonsComponent
        item={rowData}
        isReport={isReport}
        tableButtons={tableButtons}
        entity={entity}
        loginUser={loginUser}
        pathDetail={`${finalPath}/${rowData[columns[0].key]}${
          filtersApplied !== undefined
            ? `?${Object.keys(filtersApplied)
                .map(key => `${key}=${filtersApplied[key]}`)
                .join('&')}`
            : ''
        }`}
        onDelete={onDelete}
      />
    </tr>
  );
};
