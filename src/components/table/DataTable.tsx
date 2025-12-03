import { useEffect, useMemo, useState } from 'react';
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
import {
  calculateTotalAmountByEntity,
  exportTableToExcel,
} from './utils/TableUtils';

interface DataTableProps {
  data: any[];
  columns: Column[];
  filters?: Filters[];
  tableButtons: TableButtons;
  entity: EntityTable;
  onDelete?: (id: string) => void;
  totalCounts?: boolean;
  enableFilterActive?: boolean;
  enableCheckbox?: boolean;
  onChecked?: (id?: string) => void;
  isReport?: boolean;
  hideShadow?: boolean;
  hideExport?: boolean;
  totalCalculated?: number | string;
  filtersToApply?: FilterValue;
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
  totalCounts = false,
  enableFilterActive = true,
  enableCheckbox = false,
  onChecked,
  isReport = false,
  hideShadow = false,
  hideExport = false,
  totalCalculated,
}: DataTableProps) => {
  const [pathDetail, setPathDetail] = useState<string>('');
  const tableFilters = useTableFilters(enableFilterActive);
  const { loginUser } = useSessionStore(state => state);
  const [isLoading, setIsLoading] = useState(true);
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

  const { filteredData, totalRecords, totalPages } = useFilteredData(
    data,
    tableFilters.filtersApplied,
    tableFilters.filterActive,
    tableFilters.filterSparePartsUnderStock,
    tableState.sortColumn,
    tableState.sortOrder,
    tableState.currentPage,
    tableState.itemsPerPage
  );

  const formattedPrice = useMemo(
    () => calculateTotalAmountByEntity(filteredData, entity),
    [filteredData, entity]
  );

  const totalStock = useMemo(
    () =>
      filteredData.reduce((acc, item) => acc + (Number(item.stock) || 0), 0),
    [filteredData]
  );

  const footerData = useMemo(
    () =>
      columns.reduce((acc, col) => {
        if (col.key === 'stock') acc[col.key] = totalStock;
        else if (col.key === 'price') acc[col.key] = formattedPrice;
        else acc[col.key] = '';
        return acc;
      }, {} as Record<string, any>),
    [columns, totalStock, formattedPrice]
  );

  const isAllSelected =
    data.length > 0 && tableState.selectedRows.size === data.length;
  useEffect(() => {
    setIsLoading(false);
    setPathDetail(() => {
      return getRoute(entity, false);
    });
  }, []);

  // Handlers
  const handleSort = (columnKey: string) => {
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
  };

  const handleItemsPerPageChange = (value: number) => {
    tableState.setItemsPerPage(value);
    tableState.setCurrentPage(1);
  };

  const handleSelectedRow = (id: string) => {
    tableState.setSelectedRows(prev => {
      const newSelected = new Set(prev);
      newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
      return newSelected;
    });
    onChecked?.(id);
  };

  const handleSelectedAllRows = () => {
    if (tableState.selectedRows.size === data.length) {
      tableState.setSelectedRows(new Set());
    } else {
      tableState.setSelectedRows(new Set(data.map(row => row.id)));
    }
    onChecked?.();
  };

  if (filteredData)
    return (
      <div
        className={`bg-white rounded-lg ${
          !hideShadow && 'shadow-md'
        } w-full h-full flex flex-col`}
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
                  exportTableToExcel(data, columns, entity, footerData)
                }
              >
                <SvgExportExcel />
              </div>
            </div>
          )}
        </div>
        <div className="flex">
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
                itemsPerPage={tableState.itemsPerPage}
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
                totalCounts={totalCounts}
                totalQuantity={formattedPrice ?? 0}
                filtersApplied={tableFilters.filtersApplied}
              />
              {entity === EntityTable.SPAREPART &&
                columns?.find(x => x.key === 'price') && (
                  <tfoot>
                    <tr className="bg-gray-200 font-semibold text-2xl text-right">
                      {columns
                        .filter(x => x.key !== 'id')
                        .map(col => {
                          if (col.key === 'stock') {
                            return (
                              <td
                                key={col.key}
                                className="px-4 py-2 text-right"
                              >
                                {totalStock}
                              </td>
                            );
                          }
                          if (col.key === 'price' || col.key === 'total') {
                            return (
                              <td
                                key={col.key}
                                className="px-4 py-2 text-right"
                              >
                                {formattedPrice}€
                              </td>
                            );
                          }
                          return <td key={col.key}></td>;
                        })}
                      <td className="px-4 py-2 text-right"></td>
                    </tr>
                  </tfoot>
                )}
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
