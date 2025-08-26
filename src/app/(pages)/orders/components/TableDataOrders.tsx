'use client';
import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import { useQueryParams } from 'app/hooks/useFilters';
import { useOrder } from 'app/hooks/useOrder';
import { Account } from 'app/interfaces/Account';
import { Order, OrderStatus, OrderType } from 'app/interfaces/Order';
import { AccountService } from 'app/services/accountService';
import { FilterValue } from 'app/types/filters';
import { isArray, isStringArray } from 'app/utils/typeGuards';
import { DateFilter, DateFilters } from 'components/Filters/DateFilter';
import { FilterType } from 'components/table/components/Filters/FilterType';
import DataTable from 'components/table/DataTable';
import {
  Column,
  ColumnFormat,
  ColumnnAlign,
  Filters,
  FiltersFormat,
  TableButtons,
} from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';
import dayjs from 'dayjs';

import { translateOrderState } from '../orderForm/components/utilsOrder';

interface TableDataOrdersProps {
  orderType?: OrderType;
  selectedProviderId?: string;
  className?: string;
  title?: string;
  hideShadow?: boolean;
  sparePartId?: string;
  enableFilters?: boolean;
}

const DEFAULT_STATUS_FILTERS = [OrderStatus.Pending, OrderStatus.InProgress];
const DEFAULT_DATE_START = new Date(new Date().getFullYear(), 0, 1);
const DEFAULT_DATE_END = new Date();

export const TableDataOrders = ({
  orderType,
  selectedProviderId,
  className = '',
  title = '',
  hideShadow = false,
  sparePartId,
  enableFilters = true,
}: TableDataOrdersProps) => {
  const { orders, getOrderWithFilters } = useOrder();
  const [isLoading, setIsLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const { updateQueryParams, queryParams } = useQueryParams();
  const [dateFilters, setDateFilters] = useState<DateFilters>({
    startDate: null,
    endDate: null,
  });

  const [accounts, setAccounts] = useState<Account[]>([]);
  const accountService = new AccountService();
  const [message, setMessage] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  const [filters, setFilters] = useState<FilterValue>({});

  useEffect(() => {
    setIsLoading(true);
    if (dateFilters.startDate && dateFilters.endDate && isInitialized) {
      getOrderWithFilters({
        orderType: orderType,
        from: dateFilters.startDate,
        to: dateFilters.endDate,
        providerId: selectedProviderId,
        sparePartId: sparePartId,
      });
    }
    accountService.getAll().then(responseAccounts => {
      setAccounts(responseAccounts.filter(x => x.active == true));
    });
    if (orderType) {
      filtersOrders.push({
        label: 'Proveïdor',
        key: 'providerName',
        format: FiltersFormat.TEXT,
      });
    }
    setIsLoading(false);
    setFirstLoad(false);
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      const newFilters: FilterValue = { ...filters };
      if (Object.keys(queryParams).length === 0) {
        newFilters.status = enableFilters
          ? [OrderStatus.Pending, OrderStatus.InProgress]
          : [];
      }

      // Verificar si queryParams tiene las propiedades startDate y endDate
      if (queryParams) {
        const startDateStr = queryParams.startDate?.toString();
        const endDateStr = queryParams.endDate?.toString();

        if (startDateStr && endDateStr) {
          const startDate = dayjs(startDateStr).toDate();
          const endDate = dayjs(endDateStr).toDate();

          // Validar que las fechas son válidas
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            setDateFilters(prev => ({
              ...prev,
              startDate,
              endDate,
            }));
          }
        } else {
          setDateFilters(prev => ({
            ...prev,
            startDate: DEFAULT_DATE_START,
            endDate: DEFAULT_DATE_END,
          }));

          setFilters(prev => ({
            ...prev,
            status: enableFilters
              ? [OrderStatus.Pending, OrderStatus.InProgress]
              : [],
          }));
        }
      }

      Object.entries(queryParams).forEach(([key, value]) => {
        if (key === 'status') {
          if (value!.toLocaleString().split(',').length > 1) {
            const values = value!.toLocaleString().split(',');
            newFilters[key] = values.map(v => Number(v));
          } else {
            newFilters[key] = [Number(value)];
          }
        } else if (key === 'account') {
          if (isStringArray(value)) {
            newFilters[key] = value;
          } else {
            newFilters[key] = [value];
          }
        }
      });

      setFilters(newFilters);
      setIsInitialized(true);
    }
  }, [queryParams, isInitialized]);

  useEffect(() => {
    if (dateFilters.startDate && dateFilters.endDate) {
      getOrderWithFilters({
        orderType: orderType,
        from: dateFilters.startDate,
        to: dateFilters.endDate,
        providerId: selectedProviderId,
        sparePartId: sparePartId,
      });
    }
  }, [dateFilters, filters]);

  useEffect(() => {
    if (
      orders.length == 0 &&
      dateFilters.startDate &&
      dateFilters.endDate &&
      !firstLoad
    ) {
      setMessage('No hi ha comandes amb aquests filtres');
      setTimeout(() => {
        setMessage('');
      }, 5000);
    }
  }, [orders]);

  useEffect(() => {
    if (dateFilters.startDate && dateFilters.endDate && isInitialized) {
      const timeoutId = setTimeout(() => {
        const filtersApplied: Record<string, string> = {
          startDate: dayjs(dateFilters.startDate).format('YYYY-MM-DD'),
          endDate: dayjs(dateFilters.endDate).format('YYYY-MM-DD'),
        };

        // Procesar todos los filtros dinámicamente
        Object.entries(filters).forEach(([key, value]) => {
          if (value === null || value === undefined) return;

          if (Array.isArray(value)) {
            if (value.length > 0) {
              filtersApplied[key] = value.join(',');
            }
            if (value.length === 0) {
              filtersApplied[key] = '';
            }
          } else if (typeof value === 'boolean') {
            filtersApplied[key] = value ? 'true' : 'false';
          } else if (value !== '') {
            filtersApplied[key] = value.toString();
          }
        });

        updateQueryParams(filtersApplied);
      }, 300); // Debounce de 300ms

      return () => clearTimeout(timeoutId);
    }
  }, [filters, dateFilters, updateQueryParams, isInitialized]);

  const getFilteredOrders = (): Order[] => {
    return orders.filter(order => {
      // Verificar que filters.status es un array antes de usar .length e .includes
      const statusMatches =
        !isArray(filters.status) ||
        filters.status.length === 0 ||
        (isArray(filters.status) && filters.status.includes(order.status));

      // Verificar que filters.Account es un array antes de usarlo

      const accountMatches =
        !filters.account ||
        (isStringArray(filters.account) && filters.account.length === 0) ||
        (isStringArray(filters.account) &&
          filters.account.includes(
            order.accountId && order.accountId.length > 0 ? order.accountId : ''
          ));

      return statusMatches && accountMatches;
    });
  };
  const filteredOrders = getFilteredOrders();

  if (isLoading) {
    return <div>Carregant...</div>;
  }

  return (
    <div className="flex flex-col h-full gap-4 w-full">
      {title && (
        <>
          <span className="font-semibold">{title}</span>
        </>
      )}
      <div className={`flex ${className}`}>
        <div className="flex gap-4 w-full">
          <DateFilter
            setDateFilters={setDateFilters}
            dateFilters={dateFilters}
          />

          <div className="flex-1">
            <FilterType<OrderStatus>
              filters={filters}
              setFilters={setFilters}
              validTypes={
                Object.values(OrderStatus).filter(
                  value => typeof value === 'number'
                ) as OrderStatus[]
              }
              filterKey="status"
              placeholder="Estat"
              translateFn={translateOrderState}
            />
          </div>
          {accounts.length > 0 && (
            <div className="flex-1">
              <FilterType<string>
                filters={filters}
                setFilters={setFilters}
                validTypes={accounts.map(x => x.id)}
                filterKey="account"
                placeholder="Compta Comptable"
                translateFn={(id: string) => {
                  const account = accounts.find(c => c.id === id);
                  return account
                    ? `${account.code} - ${account.description}`
                    : id;
                }}
              />
            </div>
          )}
        </div>
        {message && <span className="text-red-500">{message}</span>}
      </div>
      <DataTable
        data={filteredOrders}
        columns={columnsOrders}
        entity={EntityTable.ORDER}
        tableButtons={tableButtons}
        filters={filtersOrders}
        hideShadow={hideShadow}
        totalCounts
      />
    </div>
  );
};
const tableButtons: TableButtons = {
  edit: true,
  detail: true,
};
const columnsOrders: Column[] = [
  {
    label: 'ID',
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Codi',
    key: 'code',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Estat',
    key: 'status',
    format: ColumnFormat.ORDERSTATE,
  },
  {
    label: 'Proveeïdor',
    key: 'providerName',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Data',
    key: 'date',
    format: ColumnFormat.DATE,
  },
  {
    label: 'Compta Comptable',
    key: 'account',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Total',
    key: 'totalAmountFormatted',
    format: ColumnFormat.TEXT,
    align: ColumnnAlign.RIGHT,
  },
];

const filtersOrders: Filters[] = [
  {
    label: 'Codi',
    key: 'code',
    format: FiltersFormat.TEXT,
  },
  {
    label: 'Proveïdor',
    key: 'providerName',
    format: FiltersFormat.TEXT,
  },
];
