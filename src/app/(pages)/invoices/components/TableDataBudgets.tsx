'use client';

import { useEffect, useState } from 'react';
import { Budget, BudgetStatus } from 'app/interfaces/Budget';
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

import { BudgetService } from '../../../services/budgetService';
import { BudgetPreviewPanel } from '../../budgets/components/BudgetPreviewPanel';

interface TableDataBudgetsProps {
  className?: string;
  title?: string;
  hideShadow?: boolean;
  enableFilters?: boolean;
  refreshKey?: number;
}

export const TableDataBudgets = ({
  className = '',
  title = '',
  hideShadow = false,
  enableFilters = true,
  refreshKey = 0,
}: TableDataBudgetsProps) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [firstLoad, setFirstLoad] = useState(true);

  // State para el panel de preview
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Fecha por defecto: último mes
  const defaultDateEndDate = new Date();
  const defaultDateStartDate = new Date();
  defaultDateStartDate.setMonth(defaultDateStartDate.getMonth() - 1);

  const budgetService = new BudgetService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  const [dateFilters, setDateFilters] = useState<DateFilters>({
    startDate: defaultDateStartDate,
    endDate: defaultDateEndDate,
  });

  const [filters] = useState<{ [key: string]: BudgetStatus[] }>({
    status: enableFilters
      ? [
          BudgetStatus.Draft,
          BudgetStatus.Sent,
          BudgetStatus.Accepted,
          BudgetStatus.Rejected,
          BudgetStatus.Expired,
        ]
      : [],
  });

  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    fetchBudgets();
    setFirstLoad(false);
  }, []);

  // Refetch cuando cambia refreshKey (después de crear un nuevo budget)
  useEffect(() => {
    if (refreshKey > 0) {
      fetchBudgets();
    }
  }, [refreshKey]);

  useEffect(() => {
    if (dateFilters.startDate && dateFilters.endDate && !firstLoad) {
      fetchBudgets();
    }
  }, [dateFilters, filters]);

  const fetchBudgets = async () => {
    try {
      const search = {
        startDate: dateFilters.startDate!.toISOString(),
        endDate: dateFilters.endDate!.toISOString(),
      };
      const budgets = await budgetService.getAll(search);
      setBudgets(budgets);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  useEffect(() => {
    if (
      budgets.length == 0 &&
      dateFilters.startDate &&
      dateFilters.endDate &&
      !firstLoad
    ) {
      setMessage('No hi ha pressupostos amb aquests filtres');
      setTimeout(() => {
        setMessage('');
      }, 5000);
    }
  }, [budgets]);

  const getFilteredBudgets = (): Budget[] => {
    return budgets.filter(budget => {
      const statusMatches =
        filters.status.length === 0 || filters.status.includes(budget.status);

      return statusMatches;
    });
  };

  const filteredBudgets = getFilteredBudgets();

  // Handler para abrir el preview
  const handlePreview = (item: Budget) => {
    setSelectedBudget(item);
    setIsPreviewOpen(true);
  };

  // Handler para cerrar el preview
  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    // Delay para la animación antes de limpiar el budget
    setTimeout(() => setSelectedBudget(null), 300);
  };

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
        data={filteredBudgets}
        columns={columnsBudgets}
        entity={EntityTable.BUDGET}
        tableButtons={tableButtons}
        filters={filtersBudgets}
        hideShadow={hideShadow}
        totalCounts
        onPreview={handlePreview}
      />

      {/* Panel de vista previa */}
      <BudgetPreviewPanel
        budget={selectedBudget}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onRefresh={fetchBudgets}
      />
    </div>
  );
};

const tableButtons: TableButtons = {
  edit: true,
  detail: true,
  preview: true,
};

const columnsBudgets: Column[] = [
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
    key: 'budgetDate',
    format: ColumnFormat.DATE,
  },
  {
    label: 'Vàlid fins',
    key: 'validUntil',
    format: ColumnFormat.DATE,
  },
  {
    label: 'Ordre',
    key: 'workOrderCode',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Albarà',
    key: 'deliveryNoteCode',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Total',
    key: 'total',
    format: ColumnFormat.PRICE,
    align: ColumnnAlign.RIGHT,
  },
];

const filtersBudgets: Filters[] = [
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
  {
    label: 'Ordre',
    key: 'workOrderCode',
    format: FiltersFormat.TEXT,
  },
  {
    label: 'Albarà',
    key: 'deliveryNoteCode',
    format: FiltersFormat.TEXT,
  },
];
