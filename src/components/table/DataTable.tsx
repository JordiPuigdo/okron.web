import { useEffect, useState } from 'react';
import { SvgExportExcel, SvgSpinner } from 'app/icons/icons';
import { useSessionStore } from 'app/stores/globalStore';
import useRoutes from 'app/utils/useRoutes';

import { RenderFilters } from './components/Filters/RenderFilters';
import { TableBodyComponent } from './components/TableBody';
import { TableHeader } from './components/TableHeader';
import { Column, Filters, TableButtons } from './interface/interfaceTable';
import { EntityTable } from './interface/tableEntitys';
import Pagination from './Pagination';
import { exportTableToExcel, sortData } from './utils/TableUtils';

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
}: DataTableProps) => {
  const itemsPerPageOptions = [5, 10, 15, 20, 25, 50];
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
  const ROUTES = useRoutes();
  const [pathDetail, setPathDetail] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const { loginUser, setFilterSpareParts, filterSpareParts } = useSessionStore(
    state => state
  );

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

  useEffect(() => {
    switch (entity) {
      case EntityTable.WORKORDER:
        setPathDetail(ROUTES.workOrders);
        break;
      case EntityTable.PREVENTIVE:
        setPathDetail(ROUTES.preventive.configuration);
        break;
      case EntityTable.SPAREPART:
        setPathDetail(ROUTES.spareParts);
        break;
      case EntityTable.OPERATOR:
        setPathDetail(ROUTES.configuration.operators);
        break;
      case EntityTable.MACHINE:
        setPathDetail(ROUTES.configuration.machines);
        break;
      case EntityTable.WAREHOUSE:
        setPathDetail(ROUTES.configuration.warehouse);
        break;
      case EntityTable.PROVIDER:
        setPathDetail(ROUTES.configuration.provider);
        break;
      case EntityTable.ORDER:
        setPathDetail(ROUTES.orders);
        break;
      default:
        setPathDetail('error');
    }
  }, []);

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

  const totalQuantity = 0;

  const handleItemsPerPageChange = (value: number) => {
    setIsLoading(true);
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  useEffect(() => {
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

    setTotalCount(Math.ceil(filteredRecords.length / itemsPerPage));
    setIsLoading(false);
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
    const keys = key.split('.');
    const filteredData = data.filter(item => {
      const nestedPropertyValue = keys.reduce(
        (obj, prop) => obj && obj[prop],
        item
      );
      if (value === '') return true;
      if (nestedPropertyValue) {
        const itemValue = String(nestedPropertyValue);
        const filterValue = String(value);
        return itemValue.toLowerCase().includes(filterValue.toLowerCase());
      }
      return false;
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
    setTotalRecords(filteredData.length);
    setTotalCount(Math.ceil(filteredData.length / itemsPerPage));
  };

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

  if (filteredData)
    return (
      <div
        className={`bg-white rounded-lg ${
          !hideShadow && 'shadow-md'
        } w-full h-full flex flex-col`}
      >
        <div className="flex py-2">
          {((filters !== undefined && filters?.length > 0) ||
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
                onClick={() => exportTableToExcel(data, columns, entity)}
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
                  totalQuantity={totalQuantity}
                />
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
