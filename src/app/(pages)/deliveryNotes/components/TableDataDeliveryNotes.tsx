'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
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
  const { t } = useTranslations();
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

  const [showInvoiceds, setShowInvoiceds] = useState(false);

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
      setMessage(t('no.delivery.notes.filters'));
      setTimeout(() => {
        setMessage('');
      }, 5000);
    }
  }, [deliveryNotes]);

  const getFilteredDeliveryNotes = (): DeliveryNote[] => {
    return deliveryNotes.filter(deliveryNote => {
      if (deliveryNote.isInvoiced !== showInvoiceds) {
        return false;
      }

      // Filtro por estado
      if (
        filters.status.length > 0 &&
        !filters.status.includes(deliveryNote.status)
      ) {
        return false;
      }

      // Puedes seguir añadiendo más filtros aquí (ej. fecha, cliente, etc.)
      // if (filters.client && deliveryNote.clientId !== filters.client) return false;

      return true;
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
      <div className={`flex ${className} `}>
        <div
          className="flex gap-4 justify-between w-full"
          onClick={() => setShowInvoiceds(!showInvoiceds)}
        >
          <DateFilter
            setDateFilters={setDateFilters}
            dateFilters={dateFilters}
          />
          <div className="gap-2 flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="cursor-pointer"
              checked={showInvoiceds}
            />
            💰
          </div>
        </div>
        {message && <span className="text-red-500">{message}</span>}
      </div>
      <DataTable
        data={filteredDeliveryNotes}
        columns={getColumnsDeliveryNotes(t)}
        entity={EntityTable.DELIVERYNOTE}
        tableButtons={tableButtons}
        filters={getFiltersDeliveryNotes(t)}
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

const getColumnsDeliveryNotes = (t: any): Column[] => [
  {
    label: t('common.id'),
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
    label: t('customer.ref'),
    key: 'refCustomerIds',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('internal.codes'),
    key: 'workOrderCodes',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('date'),
    key: 'deliveryNoteDate',
    format: ColumnFormat.DATE,
  },
  {
    label: t('status'),
    key: 'status',
    format: ColumnFormat.DELIVERYNOTESTATUS,
  },
  {
    label: t('total'),
    key: 'total',
    format: ColumnFormat.PRICE,
    align: ColumnnAlign.RIGHT,
  },
];

const getFiltersDeliveryNotes = (t: any): Filters[] => [
  {
    label: t('code'),
    key: 'code',
    format: FiltersFormat.TEXT,
  },
  {
    label: t('customer'),
    key: 'companyName',
    format: FiltersFormat.TEXT,
  },
  {
    label: t('customer.ref'),
    key: 'refCustomerIds',
    format: FiltersFormat.TEXT,
  },
  {
    label: t('internal.codes'),
    key: 'workOrderCodes',
    format: FiltersFormat.TEXT,
  },
];
