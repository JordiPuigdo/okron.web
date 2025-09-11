'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
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
  const { t } = useTranslations();
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
      setMessage(t('no.invoices.filters'));
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
        columns={getColumnsInvoices(t)}
        entity={EntityTable.INVOICE}
        tableButtons={tableButtons}
        filters={getFiltersInvoices(t)}
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

const getColumnsInvoices = (t: any): Column[] => [
  {
    label: 'ID',
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('code'),
    key: 'code',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('customer'),
    key: 'companyName',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('date'),
    key: 'invoiceDate',
    format: ColumnFormat.DATE,
  },
  {
    label: t('due.date'),
    key: 'dueDate',
    format: ColumnFormat.DATE,
  },
  {
    label: t('status'),
    key: 'status',
    format: ColumnFormat.INVOICESTATUS,
  },
  {
    label: t('total'),
    key: 'total',
    format: ColumnFormat.PRICE,
    align: ColumnnAlign.RIGHT,
  },
];

const getFiltersInvoices = (t: any): Filters[] => [
  {
    label: t('code'),
    key: 'code',
    format: FiltersFormat.TEXT,
  },
  {
    label: t('customer'),
    key: 'customer.name',
    format: FiltersFormat.TEXT,
  },
];
