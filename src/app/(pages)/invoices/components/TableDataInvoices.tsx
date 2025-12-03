'use client';

import { useEffect, useState } from 'react';
import { Invoice } from 'app/interfaces/Invoice';
import { DateFilter, DateFilters } from 'components/Filters/DateFilter';
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

  // Fecha por defecto: último mes
  const defaultDateEndDate = new Date();
  const defaultDateStartDate = new Date();
  defaultDateStartDate.setMonth(defaultDateStartDate.getMonth() - 1);

  const invoiceService = new InvoiceService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  const [dateFilters, setDateFilters] = useState<DateFilters>({
    startDate: defaultDateStartDate,
    endDate: defaultDateEndDate,
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
    if (dateFilters.startDate && dateFilters.endDate && !firstLoad) {
      fetchInvoices();
    }
  }, [dateFilters, filters]);

  const fetchInvoices = async () => {
    try {
      const search = {
        startDateTime: dateFilters.startDate!,
        endDateTime: dateFilters.endDate!,
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
    key: 'customerName',
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
    label: 'Albarà',
    key: 'deliveryNotesCodes',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Ref. Client',
    key: 'refCustomerIds',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Ordre',
    key: 'workOrderCodes',
    format: ColumnFormat.TEXT,
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
  {
    label: 'Ref. Client',
    key: 'refCustomerIds',
    format: FiltersFormat.TEXT,
  },
  {
    label: 'Ordre',
    key: 'workOrderCodes',
    format: FiltersFormat.TEXT,
  },
  {
    label: 'Albarà',
    key: 'deliveryNotesCodes',
    format: FiltersFormat.TEXT,
  },
];
