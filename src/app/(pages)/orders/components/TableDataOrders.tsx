'use client';
import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import { useOrder } from 'app/hooks/useOrder';
import { CostCenter } from 'app/interfaces/CostCenter';
import { Order, OrderStatus, OrderType } from 'app/interfaces/Order';
import { CostService } from 'app/services/costService';
import { DateFilter, DateFilters } from 'components/Filters/DateFilter';
import { FilterType } from 'components/table/components/Filters/FilterType';
import DataTable from 'components/table/DataTable';
import {
  Column,
  ColumnFormat,
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
}

export const TableDataOrders = ({
  orderType,
  selectedProviderId,
  className = '',
  title = '',
  hideShadow = false,
  sparePartId,
}: TableDataOrdersProps) => {
  const { orders, getOrderWithFilters } = useOrder();
  const defaultDate = new Date();
  const [dateFilters, setDateFilters] = useState<DateFilters>({
    startDate: null,
    endDate: null,
  });

  const [filters, setFilters] = useState<{ [key: string]: any[] }>({
    status: [],
  });
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const costCenterService = new CostService();
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    getOrderWithFilters({
      orderType: orderType,
      from: defaultDate,
      to: defaultDate,
      providerId: selectedProviderId,
      sparePartId: sparePartId,
    });
    costCenterService.getAll().then(costCenters => {
      setCostCenters(costCenters.filter(x => x.active == true));
    });
    if (orderType) {
      filtersOrders.push({
        label: 'Proveïdor',
        key: 'providerName',
        format: FiltersFormat.TEXT,
      });
    }
  }, []);

  useEffect(() => {
    if (dateFilters.startDate != null && dateFilters.endDate == null) {
      setDateFilters({
        startDate: dateFilters.startDate,
        endDate: defaultDate,
      });
    }
    if (dateFilters.startDate == null && dateFilters.endDate != null) {
      setDateFilters({
        startDate: defaultDate,
        endDate: dateFilters.endDate,
      });
    }
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
    if (orders.length == 0 && dateFilters.startDate && dateFilters.endDate) {
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

      const costCenterMatches =
        !filters.costCenter ||
        filters.costCenter.length === 0 ||
        filters.costCenter.includes(
          order.costCenterId && order.costCenterId?.length > 0
            ? order.costCenterId
            : ''
        );

      return statusMatches && costCenterMatches;
    });
  };

  const filteredOrders = getFilteredOrders();
  const totalAmount = filteredOrders.reduce((acc, order) => {
    return acc + (order.totalAmount ?? 0);
  }, 0);
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
              validTypes={costCenters.map(x => x.id)}
              filterKey="costCenter"
              placeholder="Centre de Costs"
              translateFn={(id: string) => {
                const costCenter = costCenters.find(c => c.id === id);
                return costCenter
                  ? `${costCenter.code} - ${costCenter.description}`
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
        totalCalculated={totalAmount}
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
    label: 'Centre de Costs',
    key: 'costCenter',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Total',
    key: 'totalAmount',
    format: ColumnFormat.PRICE,
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
