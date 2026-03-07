'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { Budget, BudgetStatus, BudgetType } from 'app/interfaces/Budget';
import { BudgetService } from 'app/services/budgetService';
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

interface TableDataAssemblyBudgetsProps {
  className?: string;
  refreshKey?: number;
}

const DEFAULT_STATUSES = [
  BudgetStatus.Draft,
  BudgetStatus.Sent,
  BudgetStatus.Accepted,
  BudgetStatus.Rejected,
  BudgetStatus.Expired,
];

const TABLE_BUTTONS: TableButtons = {
  edit: true,
  detail: true,
};

const getColumns = (t: (key: string) => string): Column[] => [
  { label: 'ID', key: 'id', format: ColumnFormat.TEXT },
  { label: t('code'), key: 'code', format: ColumnFormat.TEXT },
  { label: t('assemblyBudget.field.title'), key: 'title', format: ColumnFormat.TEXT },
  { label: t('customer'), key: 'companyName', format: ColumnFormat.TEXT },
  { label: t('date'), key: 'budgetDate', format: ColumnFormat.DATE },
  { label: t('budget.preview.validUntil'), key: 'validUntil', format: ColumnFormat.DATE },
  {
    label: t('total'),
    key: 'total',
    format: ColumnFormat.PRICE,
    align: ColumnnAlign.RIGHT,
  },
];

const getFilters = (t: (key: string) => string): Filters[] => [
  { label: t('code'), key: 'code', format: FiltersFormat.TEXT },
  { label: t('assemblyBudget.field.title'), key: 'title', format: FiltersFormat.TEXT },
  { label: t('customer'), key: 'companyName', format: FiltersFormat.TEXT },
];

function getDefaultDateRange(): DateFilters {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);
  return { startDate, endDate };
}

export const TableDataAssemblyBudgets = ({
  className = '',
  refreshKey = 0,
}: TableDataAssemblyBudgetsProps) => {
  const { t } = useTranslations();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [dateFilters, setDateFilters] = useState<DateFilters>(getDefaultDateRange);

  const columns = useMemo(() => getColumns(t), [t]);
  const filters = useMemo(() => getFilters(t), [t]);

  const serviceRef = useRef(
    new BudgetService(process.env.NEXT_PUBLIC_API_BASE_URL || '')
  );

  const fetchBudgets = useCallback(async () => {
    if (!dateFilters.startDate || !dateFilters.endDate) return;

    try {
      const search = {
        startDate: dateFilters.startDate.toISOString(),
        endDate: dateFilters.endDate.toISOString(),
      };
      const allBudgets = await serviceRef.current.getAll(search);
      setBudgets(
        allBudgets.filter(b => b.budgetType === BudgetType.Assembly)
      );
    } catch {
      setBudgets([]);
    }
  }, [dateFilters]);

  useEffect(() => {
    fetchBudgets();
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (refreshKey > 0) {
      fetchBudgets();
    }
  }, [refreshKey, fetchBudgets]);

  useEffect(() => {
    if (!isInitialLoad) {
      fetchBudgets();
    }
  }, [dateFilters, fetchBudgets, isInitialLoad]);

  const filteredBudgets = budgets.filter(
    budget => DEFAULT_STATUSES.includes(budget.status)
  );

  return (
    <div className="flex flex-col h-full gap-4 w-full">
      <div className={`flex ${className}`}>
        <div className="flex gap-4 w-full">
          <DateFilter
            setDateFilters={setDateFilters}
            dateFilters={dateFilters}
          />
        </div>
      </div>
      <DataTable
        data={filteredBudgets}
        columns={columns}
        entity={EntityTable.ASSEMBLY_BUDGET}
        tableButtons={TABLE_BUTTONS}
        filters={filters}
        totalCounts
      />
    </div>
  );
};
