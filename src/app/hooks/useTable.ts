import { useCallback, useMemo, useState } from 'react';
import { sortData } from 'components/table/utils/TableUtils';

export const useTableState = (
  initialData: any[],
  defaultItemsPerPage: number
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const totalPages = useMemo(
    () => Math.ceil(initialData.length / itemsPerPage),
    [initialData.length, itemsPerPage]
  );

  return {
    currentPage,
    setCurrentPage,
    sortColumn,
    setSortColumn,
    sortOrder,
    setSortOrder,
    itemsPerPage,
    setItemsPerPage,
    selectedRows,
    setSelectedRows,
    totalPages,
  };
};

export const useTableFilters = (enableFilterActive: boolean) => {
  const [filterActive, setFilterActive] = useState(enableFilterActive);
  const [filterSparePartsUnderStock, setFilterSparePartsUnderStock] =
    useState(false);
  const [filtersApplied, setFiltersApplied] = useState<Record<string, any>>({});

  const updateFilter = useCallback((key: string, value: any) => {
    setFiltersApplied(prev => ({
      ...prev,
      [key]: value instanceof Date ? value.toISOString() : value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersApplied({});
  }, []);

  return {
    filterActive,
    setFilterActive,
    filterSparePartsUnderStock,
    setFilterSparePartsUnderStock,
    filtersApplied,
    updateFilter,
    clearFilters,
  };
};

export const useFilteredData = (
  data: any[],
  filtersApplied: Record<string, any>,
  filterActive: boolean,
  filterSparePartsUnderStock: boolean,
  sortColumn: string,
  sortOrder: 'ASC' | 'DESC',
  currentPage: number,
  itemsPerPage: number
) => {
  return useMemo(() => {
    let filtered = data.filter(item => {
      // Filtro por estado activo
      if (filterActive && item.active !== undefined) {
        if (item.active !== filterActive) return false;
      }

      // Filtro por stock mínimo
      if (
        filterSparePartsUnderStock &&
        item.minium !== undefined &&
        item.stock !== undefined
      ) {
        if (item.stock >= item.minium) return false;
      }

      // Filtros aplicados por usuario
      return Object.entries(filtersApplied).every(([key, value]) => {
        if (!value) return true;
        if (key === 'startDate' || key === 'endDate') return true;

        const keys = key.split('.');
        const itemValue = keys.reduce((obj, prop) => obj?.[prop], item);

        if (itemValue === undefined || itemValue === null) return false;

        return String(itemValue)
          .toLowerCase()
          .includes(String(value).toLowerCase());
      });
    });

    // Ordenar
    filtered = sortData(filtered, sortColumn, sortOrder);

    // Paginar
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
      filteredData: filtered.slice(startIndex, endIndex),
      totalRecords: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
    };
  }, [
    data,
    filtersApplied,
    filterActive,
    filterSparePartsUnderStock,
    sortColumn,
    sortOrder,
    currentPage,
    itemsPerPage,
  ]);
};
