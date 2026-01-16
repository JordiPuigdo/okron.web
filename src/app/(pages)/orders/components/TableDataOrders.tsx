'use client';
import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import { useQueryParams } from 'app/hooks/useFilters';
import { useOrder } from 'app/hooks/useOrder';
import { useTranslations } from 'app/hooks/useTranslations';
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
import { OrderPreviewPanel } from './OrderPreviewPanel';

interface TableDataOrdersProps {
  orderType?: OrderType;
  selectedProviderId?: string;
  className?: string;
  title?: string;
  hideShadow?: boolean;
  sparePartId?: string;
  enableFilters?: boolean;
  dateFilterProps?: DateFilters;
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
  dateFilterProps,
}: TableDataOrdersProps) => {
  const { t } = useTranslations();
  const { orders, getOrderWithFilters } = useOrder();
  const [isLoading, setIsLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const { updateQueryParams, queryParams } = useQueryParams();
  const [dateFilters, setDateFilters] = useState<DateFilters>({
    startDate: dateFilterProps?.startDate ?? DEFAULT_DATE_START,
    endDate: dateFilterProps?.endDate ?? DEFAULT_DATE_END,
  });

  const [accounts, setAccounts] = useState<Account[]>([]);
  const accountService = new AccountService();
  const [message, setMessage] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  const [filters, setFilters] = useState<FilterValue>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
    setIsLoading(false);
    setFirstLoad(false);
  }, []);

  useEffect(() => {
    if (
      !dateFilterProps ||
      (!dateFilterProps?.startDate &&
        !dateFilterProps?.endDate &&
        !selectedProviderId)
    )
      return;
    console.log('dateFilterProps', dateFilterProps);
    getOrderWithFilters({
      orderType: orderType,
      from: dateFilterProps!.startDate!,
      to: dateFilterProps!.endDate!,
      providerId: selectedProviderId,
      sparePartId: sparePartId,
    });
  }, [selectedProviderId, dateFilterProps]);

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
    /*if (sparePartId && !isInitialized) {
      setDateFilters(prev => ({
        ...prev,
        startDate: DEFAULT_DATE_START,
        endDate: DEFAULT_DATE_END,
      }));
    }*/
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
      setMessage(t('no.orders.with.filters'));
      setTimeout(() => {
        setMessage('');
      }, 5000);
    }
  }, [orders]);

  useEffect(() => {
    if (dateFilters.startDate && dateFilters.endDate && isInitialized) {
      const timeoutId = setTimeout(() => {
        const filtersApplied: Record<string, string> = {
          startDate:
            dateFilters.startDate == DEFAULT_DATE_START
              ? ''
              : dayjs(dateFilters.startDate).format('YYYY-MM-DD'),
          endDate:
            dateFilters.endDate == DEFAULT_DATE_END
              ? ''
              : dayjs(dateFilters.endDate).format('YYYY-MM-DD'),
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

  // Handler para abrir el preview
  const handlePreview = (item: Order) => {
    setSelectedOrder(item);
    setIsPreviewOpen(true);
  };

  // Handler para cerrar el preview
  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setTimeout(() => setSelectedOrder(null), 300);
  };

  if (isLoading) {
    return <div>{t('loading')}...</div>;
  }

  return (
    <div className="flex flex-col h-full gap-4 w-full">
      {title && (
        <>
          <span className="font-semibold">{title}</span>
        </>
      )}
      {enableFilters && (
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
                placeholder={t('state')}
                translateFn={(state: OrderStatus) =>
                  translateOrderState(state, t)
                }
              />
            </div>
            {accounts.length > 0 && (
              <div className="flex-1">
                <FilterType<string>
                  filters={filters}
                  setFilters={setFilters}
                  validTypes={accounts.map(x => x.id)}
                  filterKey="account"
                  placeholder={t('accounting.account')}
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
      )}
      <DataTable
        data={filteredOrders}
        columns={getColumnsOrders(t, sparePartId ?? '')}
        entity={EntityTable.ORDER}
        tableButtons={tableButtons}
        filters={getFiltersOrders(t)}
        hideShadow={hideShadow}
        totalCounts
        onPreview={handlePreview}
      />

      {/* Panel de vista previa */}
      <OrderPreviewPanel
        order={selectedOrder}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
      />
    </div>
  );
};
const tableButtons: TableButtons = {
  edit: true,
  detail: true,
  preview: true,
};

const getColumnsOrders = (t: any, id: string): Column[] => {
  const columns = [
    {
      label: t('common.id'),
      key: 'id',
      format: ColumnFormat.TEXT,
    },
    {
      label: t('code'),
      key: 'orderCode',
      format: ColumnFormat.TEXT,
    },
    {
      label: t('state'),
      key: 'status',
      format: ColumnFormat.ORDERSTATE,
    },
    {
      label: t('provider'),
      key: 'providerName',
      format: ColumnFormat.TEXT,
    },
    {
      label: t('comment'),
      key: 'comment',
      format: ColumnFormat.TEXT,
    },
    {
      label: t('date'),
      key: 'date',
      format: ColumnFormat.DATE,
    },
    {
      label: t('accounting.account'),
      key: 'account',
      format: ColumnFormat.TEXT,
    },
    {
      label: t('total'),
      key: 'totalAmountFormatted',
      format: ColumnFormat.TEXT,
      align: ColumnnAlign.RIGHT,
    },
  ];

  if (id) {
    columns.push({
      label: t('order.quantity.received'),
      key: 'quantityReceived',
      format: ColumnFormat.NUMBER,
      align: ColumnnAlign.RIGHT,
    });
  }

  return columns;
};

const getFiltersOrders = (t: any): Filters[] => [
  {
    label: t('code'),
    key: 'orderCode',
    format: FiltersFormat.TEXT,
  },
  {
    label: t('provider'),
    key: 'providerName',
    format: FiltersFormat.TEXT,
  },
  {
    label: t('comment'),
    key: 'comment',
    format: FiltersFormat.TEXT,
  },
];
