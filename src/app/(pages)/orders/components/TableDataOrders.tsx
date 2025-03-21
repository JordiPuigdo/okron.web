'use client';
import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import { useOrder } from 'app/hooks/useOrder';
import { OrderType } from 'app/interfaces/Order';
import { DateFilter, DateFilters } from 'components/Filters/DateFilter';
import DataTable from 'components/table/DataTable';
import {
  Column,
  ColumnFormat,
  Filters,
  FiltersFormat,
  TableButtons,
} from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';

interface TableDataOrdersProps {
  orderType: OrderType;
}

export const TableDataOrders = ({ orderType }: TableDataOrdersProps) => {
  const { orders, getOrderWithFilters } = useOrder();
  const defaultDate = new Date();
  const [dateFilters, setDateFilters] = useState<DateFilters>({
    startDate: null,
    endDate: null,
  });

  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    getOrderWithFilters({
      orderType: orderType,
      from: defaultDate,
      to: defaultDate,
    });
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
      });
    }
  }, [dateFilters]);

  useEffect(() => {
    if (orders.length == 0 && dateFilters.startDate && dateFilters.endDate) {
      setMessage('No hi ha comandes amb aquests filtres');
      setTimeout(() => {
        setMessage('');
      }, 5000);
    }
  }, [orders]);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex bg-white p-4 rounded-xl shadow-md">
        <DateFilter setDateFilters={setDateFilters} dateFilters={dateFilters} />
        {message && <span className="text-red-500">{message}</span>}
      </div>
      <DataTable
        data={orders}
        columns={columnsWareHouse}
        entity={EntityTable.ORDER}
        tableButtons={tableButtons}
        filters={filtersWareHouse}
      />
    </div>
  );
};
const tableButtons: TableButtons = {
  edit: true,
  detail: true,
};
const columnsWareHouse: Column[] = [
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
];

const filtersWareHouse: Filters[] = [
  {
    label: 'Codi',
    key: 'code',
    format: FiltersFormat.TEXT,
  },
  {
    label: 'Descripció',
    key: 'description',
    format: FiltersFormat.TEXT,
  },
];
