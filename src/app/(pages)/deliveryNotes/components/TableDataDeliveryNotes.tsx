'use client';

import { useEffect, useState } from 'react';
import { DeliveryNote } from 'app/interfaces/DeliveryNote';
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

import { DeliveryNoteService } from '../../../services/deliveryNoteService';

interface TableDataDeliveryNotesProps {
  className?: string;
  title?: string;
  hideShadow?: boolean;
  enableFilters?: boolean;
}

export const TableDataDeliveryNotes = ({
                                    className = '',
                                    title = '',
                                    hideShadow = false,
                                    enableFilters = true,
                                  }: TableDataDeliveryNotesProps) => {
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const defaultDateStartDate = new Date(new Date().getFullYear(), 0, 1);
  const defaultDate = new Date();
  const deliveryNoteService = new DeliveryNoteService(
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
    fetchDeliveryNotes();
    setIsLoading(false);
    setFirstLoad(false);
  }, []);

  useEffect(() => {
    if (dateFilters.startDate && dateFilters.endDate) {
      fetchDeliveryNotes();
    }
  }, [dateFilters, filters]);

  const fetchDeliveryNotes = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const search = {
        startDateTime: startDate!,
        endDateTime: endDate!,
      };
      const deliveryNotes = await deliveryNoteService.getAll(search);
      setDeliveryNotes(deliveryNotes);
    } catch (error) {
      console.error('Error fetching delivery notes:', error);
    }
  };

  useEffect(() => {
    if (
      deliveryNotes.length == 0 &&
      dateFilters.startDate &&
      dateFilters.endDate &&
      !firstLoad
    ) {
      setMessage('No hi ha albarans amb aquests filtres');
      setTimeout(() => {
        setMessage('');
      }, 5000);
    }
  }, [deliveryNotes]);

  const getFilteredDeliveryNotes = (): DeliveryNote[] => {
    return deliveryNotes.filter(deliveryNote => {
      return filters.status.length === 0 || filters.status.includes(deliveryNote.status);
    });
  };

  const filteredDeliveryNotes = getFilteredDeliveryNotes();
  const totalAmount = filteredDeliveryNotes.reduce((acc, deliveryNote) => {
    return acc + (deliveryNote.total ?? 0);
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
        data={filteredDeliveryNotes}
        columns={columnsDeliveryNotes}
        entity={EntityTable.DELIVERYNOTE}
        tableButtons={tableButtons}
        filters={filtersDeliveryNotes}
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

const columnsDeliveryNotes: Column[] = [
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
    key: 'deliveryNoteDate',
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
    format: ColumnFormat.DELIVERYNOTESTATUS,
  },
  {
    label: 'Total',
    key: 'total',
    format: ColumnFormat.PRICE,
    align: ColumnnAlign.RIGHT,
  },
];

const filtersDeliveryNotes: Filters[] = [
  {
    label: 'Codi',
    key: 'code',
    format: FiltersFormat.TEXT,
  },
  {
    label: 'Client',
    key: 'companyName',
    format: FiltersFormat.TEXT,
  },
];