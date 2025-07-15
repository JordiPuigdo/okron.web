import { useEffect, useMemo, useState } from 'react';
import { SvgExportExcel, SvgSpinner } from 'app/icons/icons';
import { useSessionStore } from 'app/stores/globalStore';
import { FilterValue } from 'app/types/filters';
import { getRoute } from 'app/utils/utils';
import { useSearchParams } from 'next/navigation';

import { RenderFilters } from './components/Filters/RenderFilters';
import { TableBodyComponent } from './components/TableBody';
import { TableHeader } from './components/TableHeader';
import { Column, Filters, TableButtons } from './interface/interfaceTable';
import { EntityTable } from './interface/tableEntitys';
import Pagination from './Pagination';
import {
  calculateTotalAmountRecords,
  exportTableToExcel,
  sortData,
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
}

export enum ButtonTypesTable {
  Create,
  Edit,
  Delete,
  Detail,
  Sign,
  PassInspectionPoints,
}
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
  const itemsPerPageOptions = [250, 500, 1000, 2000, 3000, 5000, 10000];
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[1]);

  const [filteredData, setFilteredData] = useState<any[]>([...data]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterActive, setFilterActive] = useState(true);
  const [filterSparePartsUnderStock, setFilterSparePartsUnderStock] =
    useState(false);
  const [totalCount, setTotalCount] = useState(
    Math.ceil(data.length / itemsPerPage)
  );
  const [totalRecords, setTotalRecords] = useState(data.length);

  const [totalAmountRecords, setTotalAmountRecords] = useState<
    string | undefined
  >(undefined);

  const [pathDetail, setPathDetail] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const { loginUser } = useSessionStore(state => state);
  const [filtersApplied, setFiltersApplied] = useState<FilterValue>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const handlePageChange = (page: number) => {
    if (page < 1) return;
    setIsLoading(true);
    if (page > currentPage) {
      handleNextPage();
    } else handlePreviousPage();

    setCurrentPage(page);
  };

  const handleNextPage = async () => {
    setCurrentPage(currentPage + 1);
    setIsLoading(false);
  };

  const handlePreviousPage = async () => {
    setCurrentPage(currentPage - 1);
    setIsLoading(false);
  };

  const handleSortChange = async (sortedBy: string) => {
    if (sortedBy == '') return;
  };

  const handleSort = (columnKey: string) => {
    const order =
      sortColumn === columnKey && sortOrder === 'ASC' ? 'DESC' : 'ASC';
    setSortColumn(columnKey);
    setSortOrder(order);

    const sortText = columnKey + ' : ' + order;
    handleSortChange(sortText);
  };

  const handleItemsPerPageChange = (value: number) => {
    setIsLoading(true);
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    console.log('useEffect DataTable');

    const indexOfLastRecord = currentPage * itemsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;

    data = sortData(data, sortColumn, sortOrder);

    const filterByActiveStatus = (record: any) =>
      typeof record === 'object' &&
      record.hasOwnProperty('active') &&
      (!filterActive || record.active);

    const filterByUnderStock = (record: any) =>
      typeof record === 'object' &&
      record.hasOwnProperty('minium') &&
      record.minium > 0 &&
      record.stock < record.minium;

    let filteredRecords = data;

    if (enableFilterActive) {
      filteredRecords = filteredRecords.filter(filterByActiveStatus);
    }

    if (filterSparePartsUnderStock) {
      filteredRecords = filteredRecords.filter(filterByUnderStock);
    }

    setTotalRecords(filteredRecords.length);

    setFilteredData(
      filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord)
    );

    setTotalAmountRecords(calculateTotalAmountRecords(filteredRecords));
    setTotalCount(Math.ceil(filteredRecords.length / itemsPerPage));

    setIsLoading(false);

    if (filteredRecords.length > 0) setIsLoaded(true);
  }, [
    data,
    currentPage,
    itemsPerPage,
    filterActive,
    sortOrder,
    sortColumn,
    filterSparePartsUnderStock,
  ]);

  const handleFilterChange = (key: string, value: string | boolean | Date) => {
    if (!isLoaded || data.length === 0) return;
    console.log('handleFilterChange', key, value);
    const newFilters = {
      ...filtersApplied,
      [key]: value,
    };

    setFiltersApplied(newFilters);
    if (currentPage !== 1) setCurrentPage(1);

    const filteredData = data.filter(item => {
      return Object.entries(newFilters).every(([filterKey, filterValue]) => {
        if (filterValue === '') return true;

        const keys = filterKey.split('.');
        const nestedPropertyValue = keys.reduce(
          (obj, prop) => obj && obj[prop],
          item
        );

        if (!nestedPropertyValue) return false;

        const itemValue = String(nestedPropertyValue);
        const searchValue = String(filterValue);

        return itemValue.toLowerCase().includes(searchValue.toLowerCase());
      });
    });

    const indexOfLastRecord = currentPage * itemsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;

    if (enableFilterActive && filterActive) {
      setFilteredData(
        filteredData
          .filter(x => x['active'] == filterActive)
          .slice(indexOfFirstRecord, indexOfLastRecord)
      );
    } else {
      setFilteredData(
        filteredData.slice(indexOfFirstRecord, indexOfLastRecord)
      );
    }
    calculateTotalAmountRecords(filteredData);
    setTotalRecords(filteredData.length);
    setTotalCount(Math.ceil(filteredData.length / itemsPerPage));
  };

  useEffect(() => {
    setPathDetail(() => {
      return getRoute(entity);
    });
  }, []);

  const handleSelectedRow = (id: string) => {
    setSelectedRows(prevSelectedRows => {
      const newSelectedRows = new Set(prevSelectedRows);
      if (newSelectedRows.has(id)) {
        newSelectedRows.delete(id);
      } else {
        newSelectedRows.add(id);
      }
      return newSelectedRows;
    });
    onChecked && onChecked(id);
  };

  const handleSelectedAllRows = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map(row => row.id))); // Select all rows
    }
    onChecked && onChecked();
  };

  const isAllSelected =
    data.length > 0 && selectedRows.size === data.length ? true : false;

  const totalPrice = useMemo(() => {
    return filteredData.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      const stock = Number(item.stock) || 0;
      return acc + price * stock;
    }, 0);
  }, [filteredData]);

  const formattedPrice = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(totalPrice);

  const totalStock = useMemo(() => {
    return filteredData.reduce((acc, item) => {
      return acc + (Number(item.stock) || 0);
    }, 0);
  }, [filteredData]);

  const footerData = columns.reduce((acc, col) => {
    if (col.key === 'stock') {
      acc[col.key] = totalStock;
    } else if (col.key === 'price') {
      acc[col.key] = `${totalPrice.toFixed(2)} €`;
    } else {
      acc[col.key] = ''; // o algún otro valor si lo necesitas
    }
    return acc;
  }, {} as Record<string, any>);

  if (filteredData)
    return (
      <div
        className={`bg-white rounded-lg ${
          !hideShadow && 'shadow-md'
        } w-full h-full flex flex-col`}
      >
        <div className="flex py-2">
          {isLoaded &&
            filteredData &&
            ((filters !== undefined && filters?.length > 0) ||
              enableFilterActive) && (
              <RenderFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onFilterActive={setFilterActive}
                onFilterSparePartsUnderStock={setFilterSparePartsUnderStock}
                enableFilterActive={enableFilterActive}
                entity={entity}
                isReport={isReport}
              />
            )}
          {!hideExport && (
            <div className="flex w-full justify-end">
              <div
                className="p-2 rounded-lg m-2 items-center bg-green-700 text-white hover:bg-green-900 cursor-pointer"
                title="Exportar a Excel"
                onClick={() =>
                  exportTableToExcel(data, columns, entity, footerData)
                }
              >
                <SvgExportExcel />
              </div>
            </div>
          )}
        </div>
        <div className="p-2 flex-1 overflow-auto">
          {isLoading ? (
            <SvgSpinner className="w-full justify-center" />
          ) : (
            <div className="flex-grow overflow-auto">
              <table className="w-full text-left text-sm" id={`table${entity}`}>
                <TableHeader
                  columns={columns}
                  enableCheckbox={enableCheckbox}
                  handleSelectedAllRows={handleSelectedAllRows}
                  isAllSelected={isAllSelected}
                  handleSort={handleSort}
                  sortColumn={sortColumn}
                  sortOrder={sortOrder}
                  tableButtons={tableButtons}
                  entity={entity}
                />
                <TableBodyComponent
                  filteredData={filteredData}
                  itemsPerPage={itemsPerPage}
                  handleSelectedRow={handleSelectedRow}
                  enableCheckbox={enableCheckbox}
                  selectedRows={selectedRows}
                  columns={columns}
                  entity={entity}
                  isReport={isReport}
                  tableButtons={tableButtons}
                  loginUser={loginUser}
                  pathDetail={pathDetail}
                  onDelete={onDelete ? onDelete : undefined}
                  totalCounts={totalCounts}
                  totalQuantity={totalAmountRecords ?? 0}
                  filtersApplied={filtersApplied}
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
                            if (col.key === 'price') {
                              return (
                                <td
                                  key={col.key}
                                  className="px-4 py-2 text-right"
                                >
                                  {formattedPrice}
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
            </div>
          )}
        </div>
        <div className="p-4 flex flex-row justify-between items-center border-t border-gray-200">
          {data.length > 0 && (
            <p className="text-sm w-full">Total: {totalRecords} registres</p>
          )}
          <div className="flex align-bottom items-center w-full">
            <select
              value={itemsPerPage}
              onChange={e => handleItemsPerPageChange(Number(e.target.value))}
              className="text-sm bg-blue-gray-100 rounded-lg border border-gray-500"
            >
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="ml-2 text-sm">registres per pàgina</p>
          </div>

          <div className="justify-end items-center w-full">
            <Pagination
              currentPage={currentPage}
              totalPages={totalCount}
              onPageChange={handlePageChange}
              hasNextPage={currentPage < totalCount}
            />
          </div>
        </div>
      </div>
    );
  return <>No results</>;
};

export default DataTable;
