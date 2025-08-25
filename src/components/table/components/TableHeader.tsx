import React from 'react';

import {
  Column,
  ColumnFormat,
  ColumnnAlign,
} from '../interface/interfaceTable';
import { EntityTable } from '../interface/tableEntitys';
import { HeadTableActions } from './ButtonsTable/TableActions';

interface TableHeaderProps {
  columns: Column[];
  enableCheckbox: boolean;
  handleSelectedAllRows: () => void;
  isAllSelected: boolean | undefined;
  handleSort: (key: string) => void;
  sortColumn: string;
  sortOrder: 'ASC' | 'DESC';
  tableButtons: {
    detail?: boolean;
    edit?: boolean;
  };
  entity: EntityTable;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  enableCheckbox,
  handleSelectedAllRows,
  isAllSelected,
  handleSort,
  sortColumn,
  sortOrder,
  tableButtons,
  entity,
}) => {
  return (
    <thead>
      <tr className="border-t border-gray-200 flex-grow">
        {enableCheckbox && (
          <th
            className="border-b border-blue-gray-100 bg-blue-gray-50 p-2 cursor-pointer"
            onClick={handleSelectedAllRows}
          >
            <div className="flex items-center justify-center gap-2">
              <input
                type="checkbox"
                checked={isAllSelected || false}
                readOnly
              />
            </div>
          </th>
        )}
        {columns.map(column => {
          if (
            column.key.toLocaleUpperCase() !== 'ID' &&
            column.label.toLocaleUpperCase() !== 'ID'
          ) {
            let classname = 'flex';
            if (
              column.format == ColumnFormat.NUMBER ||
              column.format == ColumnFormat.PRICE
            ) {
              classname += 'justify-end text-end pr-4';
            }

            if (column.align === ColumnnAlign.RIGHT) {
              classname += ' justify-end pr-4 ';
            }

            return (
              <th
                key={column.key}
                className={`border-b border-blue-gray-100 bg-blue-gray-50 p-4 cursor-pointer ${
                  column.width && column.width
                }`}
                onClick={() => handleSort(column.key)}
              >
                <div className={classname}>
                  <label
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    {column.label}
                  </label>
                  {sortColumn === column.key && (
                    <span className="ml-2">
                      {sortOrder === 'ASC' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            );
          }
        })}
        {(tableButtons.detail || tableButtons.edit) && (
          <HeadTableActions tableButtons={tableButtons} entity={entity} />
        )}
      </tr>
    </thead>
  );
};
