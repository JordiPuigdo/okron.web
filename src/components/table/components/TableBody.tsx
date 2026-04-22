import { memo, RefObject } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { FilterValue } from 'app/types/filters';

import { Column } from '../interface/interfaceTable';
import { EntityTable } from '../interface/tableEntitys';
import TableRowComponent from './TableRowComponent';
import { TableTotalRowComponent } from './TableTotalRowComponent';

const ROW_HEIGHT_ESTIMATE = 45;

interface TableBodyProps {
  filteredData: any[];
  handleSelectedRow: (id: string) => void;
  enableCheckbox: boolean;
  selectedRows: Set<string>;
  columns: Column[];
  entity: EntityTable;
  isReport: boolean;
  tableButtons: any;
  loginUser: any;
  pathDetail: string;
  onDelete?: (id: string) => void;
  onEdit?: (item: any) => void;
  onPreview?: (item: any) => void;
  onCopy?: (item: any) => void;
  totalCounts: boolean;
  totalQuantity: number | string;
  filtersApplied: FilterValue;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}

const TableBodyComponentInner: React.FC<TableBodyProps> = ({
  filteredData,
  handleSelectedRow,
  enableCheckbox,
  selectedRows,
  columns,
  entity,
  isReport,
  tableButtons,
  loginUser,
  pathDetail,
  onDelete,
  onEdit,
  onPreview,
  onCopy,
  totalCounts,
  totalQuantity,
  filtersApplied,
  scrollContainerRef,
}) => {
  const virtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_HEIGHT_ESTIMATE,
    overscan: 20,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <tbody className="w-full border-b">
      {virtualItems.length > 0 && (
        <tr>
          <td
            style={{ height: virtualItems[0].start, padding: 0 }}
            colSpan={999}
          />
        </tr>
      )}
      {virtualItems.map(virtualRow => {
        const rowData = filteredData[virtualRow.index];
        return (
          <TableRowComponent
            key={rowData.id}
            rowIndex={virtualRow.index}
            rowData={rowData}
            columns={columns}
            handleSelectedRow={handleSelectedRow}
            enableCheckbox={enableCheckbox}
            selectedRows={selectedRows}
            entity={entity}
            isReport={isReport}
            tableButtons={tableButtons}
            loginUser={loginUser}
            pathDetail={pathDetail}
            onDelete={onDelete}
            onEdit={onEdit}
            onPreview={onPreview}
            onCopy={onCopy}
            filtersApplied={filtersApplied}
          />
        );
      })}
      {virtualItems.length > 0 && (
        <tr>
          <td
            style={{
              height:
                virtualizer.getTotalSize() -
                (virtualItems[virtualItems.length - 1].end || 0),
              padding: 0,
            }}
            colSpan={999}
          />
        </tr>
      )}
      <TableTotalRowComponent
        totalCounts={totalCounts}
        totalQuantity={totalQuantity}
        columnsLength={columns.length}
      />
    </tbody>
  );
};

export const TableBodyComponent = memo(TableBodyComponentInner);
