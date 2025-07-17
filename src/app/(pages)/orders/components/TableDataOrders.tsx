'use client';
import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import { useOrder } from 'app/hooks/useOrder';
import { Account } from 'app/interfaces/Account';
import { Order, OrderStatus, OrderType } from 'app/interfaces/Order';
import { AccountService } from 'app/services/accountService';
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
  const defaultDateStartDate = new Date(new Date().getFullYear(), 0, 1);
  const defaultDate = new Date();

  const [dateFilters, setDateFilters] = useState<DateFilters>({
    startDate: defaultDateStartDate,
    endDate: defaultDate,
  });

  const [filters, setFilters] = useState<{ [key: string]: any[] }>({
    status: enableFilters ? [0, 1] : [],
  });
  const [Accounts, setAccounts] = useState<Account[]>([]);
  const accountService = new AccountService();
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    setIsLoading(true);
    getOrderWithFilters({
      orderType: orderType,
      from: defaultDateStartDate,
      to: defaultDate,
      providerId: selectedProviderId,
      sparePartId: sparePartId,
    });
    accountService.getAll().then(Accounts => {
      setAccounts(Accounts.filter(x => x.active == true));
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
    /*if (dateFilters.startDate != null && dateFilters.endDate == null) {
      setDateFilters({
        startDate: dateFilters.startDate,
        endDate: defaultDate,
      });
    }
    if (dateFilters.startDate == null && dateFilters.endDate != null) {
      setDateFilters({
        startDate: defaultDateStartDate,
        endDate: dateFilters.endDate,
      });
    }*/
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

  const getFilteredOrders = (): Order[] => {
    return orders.filter(order => {
      const statusMatches =
        filters.status.length === 0 || filters.status.includes(order.status);

      const AccountMatches =
        !filters.Account ||
        filters.Account.length === 0 ||
        filters.Account.includes(
          order.accountId && order.accountId?.length > 0 ? order.accountId : ''
        );

      return statusMatches && AccountMatches;
    });
  };

  const filteredOrders = getFilteredOrders();
  const totalAmount = filteredOrders.reduce((acc, order) => {
    return acc + (order.totalAmount ?? 0);
  }, 0);

  const formattedPrice = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(totalAmount);

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
          <div className="flex-1">
            <FilterType<string>
              filters={filters}
              setFilters={setFilters}
              validTypes={Accounts.map(x => x.id)}
              filterKey="Account"
              placeholder="Compta Comptable"
              translateFn={(id: string) => {
                const Account = Accounts.find(c => c.id === id);
                return Account
                  ? `${Account.code} - ${Account.description}`
                  : id;
              }}
            />
          </div>
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
        totalCalculated={Number(formattedPrice)}
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
    key: 'totalAmount',
    format: ColumnFormat.PRICE,
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
