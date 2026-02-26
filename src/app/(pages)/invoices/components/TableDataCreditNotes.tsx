'use client';

import { useEffect, useState } from 'react';
import { CreditNote } from 'app/interfaces/CreditNote';
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

import { CreditNoteService } from '../../../services/creditNoteService';

interface TableDataCreditNotesProps {
  className?: string;
  title?: string;
  hideShadow?: boolean;
}

export const TableDataCreditNotes = ({
  className = '',
  title = '',
  hideShadow = false,
}: TableDataCreditNotesProps) => {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [firstLoad, setFirstLoad] = useState(true);

  const defaultDateEndDate = new Date();
  const defaultDateStartDate = new Date();
  defaultDateStartDate.setMonth(defaultDateStartDate.getMonth() - 1);

  const creditNoteService = new CreditNoteService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  const [dateFilters, setDateFilters] = useState<DateFilters>({
    startDate: defaultDateStartDate,
    endDate: defaultDateEndDate,
  });

  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    fetchCreditNotes();
    setFirstLoad(false);
  }, []);

  useEffect(() => {
    if (dateFilters.startDate && dateFilters.endDate && !firstLoad) {
      fetchCreditNotes();
    }
  }, [dateFilters]);

  const fetchCreditNotes = async () => {
    try {
      const search = {
        startDate: dateFilters.startDate?.toISOString(),
        endDate: dateFilters.endDate?.toISOString(),
      };
      const data = await creditNoteService.getAll(search);
      setCreditNotes(data);
    } catch (error) {
      console.error('Error fetching credit notes:', error);
    }
  };

  useEffect(() => {
    if (
      creditNotes.length === 0 &&
      dateFilters.startDate &&
      dateFilters.endDate &&
      !firstLoad
    ) {
      setMessage('No hi ha abonaments amb aquests filtres');
      setTimeout(() => {
        setMessage('');
      }, 5000);
    }
  }, [creditNotes]);

  return (
    <div className="flex flex-col h-full gap-4 w-full">
      {title && <span className="font-semibold">{title}</span>}
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
        data={creditNotes}
        columns={columnsCreditNotes}
        entity={EntityTable.CREDITNOTE}
        tableButtons={tableButtons}
        filters={filtersCreditNotes}
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

const columnsCreditNotes: Column[] = [
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
    label: 'Factura Original',
    key: 'originalInvoiceCode',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Client',
    key: 'companyName',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Data',
    key: 'creditNoteDate',
    format: ColumnFormat.DATE,
  },
  {
    label: 'Tipus',
    key: 'type',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Motiu',
    key: 'reason',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Total',
    key: 'total',
    format: ColumnFormat.PRICE,
    align: ColumnnAlign.RIGHT,
  },
];

const filtersCreditNotes: Filters[] = [
  {
    label: 'Codi',
    key: 'code',
    format: FiltersFormat.TEXT,
  },
  {
    label: 'Factura Original',
    key: 'originalInvoiceCode',
    format: FiltersFormat.TEXT,
  },
  {
    label: 'Client',
    key: 'companyName',
    format: FiltersFormat.TEXT,
  },
  {
    label: 'Motiu',
    key: 'reason',
    format: FiltersFormat.TEXT,
  },
];
