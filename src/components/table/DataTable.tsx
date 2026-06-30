import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryParams } from 'app/hooks/useFilters';
import {
  useFilteredData,
  useTableFilters,
  useTableState,
} from 'app/hooks/useTable';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgExportExcel, SvgSpinner } from 'app/icons/icons';
import { useSessionStore } from 'app/stores/globalStore';
import { FilterValue } from 'app/types/filters';
import { getRoute } from 'app/utils/utils';

import { RenderFilters } from './components/Filters/RenderFilters';
import { TableBodyComponent } from './components/TableBody';
import { TableHeader } from './components/TableHeader';
import { Column, Filters, TableButtons } from './interface/interfaceTable';
import { EntityTable } from './interface/tableEntitys';
import Pagination from './Pagination';
import { exportTableToExcel } from './utils/TableUtils';

interface DataTableProps {
  data: any[];
  columns: Column[];
  filters?: Filters[];
  tableButtons: TableButtons;
  entity: EntityTable;
  onDelete?: (id: string) => void;
  onEdit?: (item: any) => void;
  onPreview?: (item: any) => void;
  onCopy?: (item: any) => void;
  totalCounts?: boolean;
  enableFilterActive?: boolean;
  enableCheckbox?: boolean;
  onChecked?: (id?: string) => void;
  isReport?: boolean;
  hideShadow?: boolean;
  hideExport?: boolean;
  filtersToApply?: FilterValue;
  isLoading?: boolean;
  enableCurrencyFormat?: boolean;
}

export enum ButtonTypesTable {
  Create,
  Edit,
  Delete,
  Detail,
  Sign,
  PassInspectionPoints,
}

const itemsPerPageOptions = [250, 500, 1000, 2000, 3000, 5000, 10000];

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  filters,
  tableButtons,
  entity,
  onDelete,
  onEdit,
  onPreview,
  onCopy,
  totalCounts = false,
  enableFilterActive = true,
  enableCheckbox = false,
  onChecked,
  isReport = false,
  hideShadow = false,
  hideExport = false,
  isLoading: isLoadingProp,
  enableCurrencyFormat = false,
}: DataTableProps) => {
  const [pathDetail, setPathDetail] = useState<string>('');
  const tableFilters = useTableFilters(enableFilterActive);
  const { loginUser } = useSessionStore(state => state);
  const [isLoadingInternal, setIsLoadingInternal] = useState(true);
  const isLoading =
    isLoadingProp !== undefined ? isLoadingProp : isLoadingInternal;
  const { t } = useTranslations();
  const { queryParams, updateQueryParams } = useQueryParams();

  const initialSortColumn = queryParams.sortColumn?.toString() || '';
  const initialSortOrder = (queryParams.sortOrder?.toString() || 'ASC') as
    | 'ASC'
    | 'DESC';

  const tableState = useTableState(
    data,
    itemsPerPageOptions[1],
    initialSortColumn,
    initialSortOrder
  );

  const { filteredData, allFilteredData, totalRecords, totalPages } =
    useFilteredData(
      data,
      tableFilters.filtersApplied,
      tableFilters.filterActive,
      tableFilters.filterSparePartsUnderStock,
      tableState.sortColumn,
      tableState.sortOrder,
      tableState.currentPage,
      tableState.itemsPerPage
    );

  const totals = useMemo(
    () =>
      columns.reduce((acc, col) => {
        if (!col.summable) return acc;
        acc[col.key] = allFilteredData.reduce(
          (sum, row) =>
            sum +
            (col.valueGetter
              ? col.valueGetter(row)
              : Number(row[col.key]) || 0),
          0
        );
        return acc;
      }, {} as Record<string, number>),
    [columns, allFilteredData]
  );

  const footerData = useMemo(
    () =>
      columns.reduce((acc, col) => {
        acc[col.key] = col.summable ? totals[col.key] ?? 0 : '';
        return acc;
      }, {} as Record<string, number | string>),
    [columns, totals]
  );

  const isAllSelected =
    data.length > 0 && tableState.selectedRows.size === data.length;
  useEffect(() => {
    setIsLoadingInternal(false);
    setPathDetail(() => {
      return getRoute(entity, false);
    });
  }, []);

  // Handlers
  const handleSort = useCallback(
    (columnKey: string) => {
      const order =
        tableState.sortColumn === columnKey && tableState.sortOrder === 'ASC'
          ? 'DESC'
          : 'ASC';
      tableState.setSortColumn(columnKey);
      tableState.setSortOrder(order);

      updateQueryParams({
        sortColumn: columnKey,
        sortOrder: order,
      });
    },
    [tableState.sortColumn, tableState.sortOrder, updateQueryParams]
  );

  const handleItemsPerPageChange = useCallback(
    (value: number) => {
      tableState.setItemsPerPage(value);
      tableState.setCurrentPage(1);
    },
    [tableState.setItemsPerPage, tableState.setCurrentPage]
  );

  const handleSelectedRow = useCallback(
    (id: string) => {
      tableState.setSelectedRows(prev => {
        const newSelected = new Set(prev);
        newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
        return newSelected;
      });
      onChecked?.(id);
    },
    [onChecked]
  );

  const handleSelectedAllRows = useCallback(() => {
    if (tableState.selectedRows.size === data.length) {
      tableState.setSelectedRows(new Set());
    } else {
      tableState.setSelectedRows(new Set(data.map(row => row.id)));
    }
    onChecked?.();
  }, [tableState.selectedRows.size, data, onChecked]);

  if (filteredData)
    return (
      <div
        className={`bg-white rounded-lg ${
          !hideShadow && 'shadow-md'
        } w-full flex flex-col`}
      >
        <div className="flex py-2">
          {filteredData &&
            ((filters !== undefined && filters?.length > 0) ||
              enableFilterActive) && (
              <RenderFilters
                filters={filters}
                onFilterChange={tableFilters.updateFilter}
                onFilterActive={tableFilters.setFilterActive}
                onFilterSparePartsUnderStock={
                  tableFilters.setFilterSparePartsUnderStock
                }
                enableFilterActive={enableFilterActive}
                entity={entity}
                isReport={isReport}
              />
            )}
          {!hideExport && (
            <div className="flex w-full justify-end">
              <div
                className="p-2 rounded-lg m-2 items-center bg-green-700 text-white hover:bg-green-900 cursor-pointer"
                title={t('table.export.excel')}
                onClick={() =>
                  exportTableToExcel(data, columns, entity, footerData, enableCurrencyFormat)
                }
              >
                <SvgExportExcel />
              </div>
            </div>
          )}
        </div>
        <div className="flex overflow-x-auto">
          {isLoading ? (
            <SvgSpinner className="w-full justify-center" />
          ) : (
            <table className="w-full text-sm" id={`table${entity}`}>
              <TableHeader
                columns={columns}
                enableCheckbox={enableCheckbox}
                handleSelectedAllRows={handleSelectedAllRows}
                isAllSelected={isAllSelected}
                handleSort={handleSort}
                sortColumn={tableState.sortColumn}
                sortOrder={tableState.sortOrder}
                tableButtons={tableButtons}
                entity={entity}
              />

              <TableBodyComponent
                filteredData={filteredData}
                handleSelectedRow={handleSelectedRow}
                enableCheckbox={enableCheckbox}
                selectedRows={tableState.selectedRows}
                columns={columns}
                entity={entity}
                isReport={isReport}
                tableButtons={tableButtons}
                loginUser={loginUser}
                pathDetail={pathDetail}
                onDelete={onDelete ? onDelete : undefined}
                onEdit={onEdit}
                onPreview={onPreview}
                onCopy={onCopy}
                totalCounts={totalCounts}
                totals={totals}
                totalLabel={t('total')}
                filtersApplied={tableFilters.filtersApplied}
              />
            </table>
          )}
        </div>
        <div className="p-4 flex flex-row justify-between items-center border-t border-gray-200">
          {data.length > 0 && (
            <p className="text-sm w-full">
              {t('table.total.records', { count: totalRecords.toString() })}
            </p>
          )}
          <div className="flex align-bottom items-center w-full">
            <select
              value={tableState.itemsPerPage}
              onChange={e => handleItemsPerPageChange(Number(e.target.value))}
              className="text-sm bg-blue-gray-100 rounded-lg border border-gray-500"
            >
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="ml-2 text-sm">{t('table.records.per.page')}</p>
          </div>

          <div className="justify-end items-center w-full">
            <Pagination
              currentPage={tableState.currentPage}
              totalPages={totalPages}
              onPageChange={tableState.setCurrentPage}
              hasNextPage={tableState.currentPage < tableState.totalPages}
            />
          </div>
        </div>
      </div>
    );
  return <>No results</>;
};

export default DataTable;
