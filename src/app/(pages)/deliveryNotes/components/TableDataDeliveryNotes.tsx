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
import { useRouter, useSearchParams } from 'next/navigation';

import { DeliveryNoteService } from '../../../services/deliveryNoteService';
import { DeliveryNotePreviewPanel } from './DeliveryNotePreviewPanel';

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
  const router = useRouter();
  const searchParams = useSearchParams();

  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);

  // State para el panel de preview
  const [selectedDeliveryNote, setSelectedDeliveryNote] =
    useState<DeliveryNote | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  // Leer showInvoiceds de la URL
  const showInvoicedsFromUrl = searchParams.get('showInvoiced') === 'true';
  const [showInvoiceds, setShowInvoiceds] = useState(showInvoicedsFromUrl);

  // Sincronizar con URL cuando cambia el param externo
  useEffect(() => {
    const urlValue = searchParams.get('showInvoiced') === 'true';
    if (urlValue !== showInvoiceds) {
      setShowInvoiceds(urlValue);
    }
  }, [searchParams]);

  // Actualizar URL cuando cambia showInvoiceds
  const handleToggleShowInvoiceds = () => {
    const newValue = !showInvoiceds;
    setShowInvoiceds(newValue);
    const params = new URLSearchParams(searchParams.toString());
    params.set('showInvoiced', newValue.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
  };

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
      const search = {
        startDate: dateFilters.startDate!,
        endDate: dateFilters.endDate!,
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
      // Filtro por facturado: si showInvoiceds es true, mostrar solo facturados
      // Si showInvoiceds es false, mostrar solo no facturados
      // Si queremos mostrar todos, comentar o eliminar este filtro
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

  // Handler para abrir el preview
  const handlePreview = (item: DeliveryNote) => {
    setSelectedDeliveryNote(item);
    setIsPreviewOpen(true);
  };

  // Handler para cerrar el preview
  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    // Delay para la animación antes de limpiar
    setTimeout(() => setSelectedDeliveryNote(null), 300);
  };

  return (
    <div className="flex flex-col h-full gap-4 w-full">
      {title && (
        <>
          <span className="font-semibold">{title}</span>
        </>
      )}
      <div className={`flex ${className} `}>
        <div className="flex gap-4 justify-between w-full">
          <DateFilter
            setDateFilters={setDateFilters}
            dateFilters={dateFilters}
          />
          <div
            className="gap-2 flex items-center cursor-pointer"
            onClick={handleToggleShowInvoiceds}
          >
            <input
              type="checkbox"
              className="cursor-pointer"
              checked={showInvoiceds}
              onChange={() => {}} // Controlado por onClick del div
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
        onPreview={handlePreview}
      />

      {/* Panel de vista previa */}
      <DeliveryNotePreviewPanel
        deliveryNote={selectedDeliveryNote}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onRefresh={fetchDeliveryNotes}
      />
    </div>
  );
};

const tableButtons: TableButtons = {
  edit: true,
  detail: true,
  preview: true,
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
