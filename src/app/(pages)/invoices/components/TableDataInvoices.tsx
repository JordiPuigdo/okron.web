'use client';

import { useEffect, useState } from 'react';
import { Invoice, InvoiceStatus } from 'app/interfaces/Invoice';
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

import { InvoiceService } from '../../../services/invoiceService';

interface TableDataInvoicesProps {
  className?: string;
  title?: string;
  hideShadow?: boolean;
  enableFilters?: boolean;
}

export const TableDataInvoices = ({
                                    className = '',
                                    title = '',
                                    hideShadow = false,
                                    enableFilters = true,
                                  }: TableDataInvoicesProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const defaultDateStartDate = new Date(new Date().getFullYear(), 0, 1);
  const defaultDate = new Date();
  const invoiceService = new InvoiceService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  const [dateFilters, setDateFilters] = useState<DateFilters>({
    startDate: defaultDateStartDate,
    endDate: defaultDate,
  });

  const [filters, setFilters] = useState<{ [key: string]: any[] }>({
    status: enableFilters ? [0, 1, 2] : [],
  });

  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    setIsLoading(true);
    fetchInvoices();
    setIsLoading(false);
    setFirstLoad(false);
  }, []);

  useEffect(() => {
    if (dateFilters.startDate && dateFilters.endDate) {
      fetchInvoices();
    }
  }, [dateFilters, filters]);

  const fetchInvoices = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const search = {
        startDateTime: startDate!,
        endDateTime: endDate!,
      };
      const invoices = await invoiceService.getAll(search);
      setInvoices(invoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  useEffect(() => {
    if (
      invoices.length == 0 &&
      dateFilters.startDate &&
      dateFilters.endDate &&
      !firstLoad
    ) {
      setMessage('No hi ha factures amb aquests filtres');
      setTimeout(() => {
        setMessage('');
      }, 5000);
    }
  }, [invoices]);

  const getFilteredInvoices = (): Invoice[] => {
    return invoices.filter(invoice => {
      const statusMatches =
        filters.status.length === 0 || filters.status.includes(invoice.status);

      return statusMatches;
    });
  };

  const filteredInvoices = getFilteredInvoices();
  const totalAmount = filteredInvoices.reduce((acc, invoice) => {
    return acc + (invoice.total ?? 0);
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
        </div>
        {message && <span className="text-red-500">{message}</span>}
      </div>
      <DataTable
        data={filteredInvoices}
        columns={columnsInvoices}
        entity={EntityTable.INVOICE}
        tableButtons={tableButtons}
        filters={filtersInvoices}
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

const columnsInvoices: Column[] = [
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
    label: 'Client',
    key: 'companyName',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Data',
    key: 'invoiceDate',
    format: ColumnFormat.DATE,
  },
  {
    label: 'Venciment',
    key: 'dueDate',
    format: ColumnFormat.DATE,
  },
  {
    label: 'Estat',
    key: 'status',
    format: ColumnFormat.INVOICESTATUS,
  },
  {
    label: 'Total',
    key: 'total',
    format: ColumnFormat.PRICE,
    align: ColumnnAlign.RIGHT,
  },
];

const filtersInvoices: Filters[] = [
  {
    label: 'Codi',
    key: 'code',
    format: FiltersFormat.TEXT,
  },
  {
    label: 'Client',
    key: 'customer.name',
    format: FiltersFormat.TEXT,
  },
];