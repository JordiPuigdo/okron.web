'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

const COLUMNS: Column[] = [
  { label: 'ID', key: 'id', format: ColumnFormat.TEXT },
  { label: 'Codi', key: 'code', format: ColumnFormat.TEXT },
  { label: 'Client', key: 'companyName', format: ColumnFormat.TEXT },
  { label: 'Data', key: 'budgetDate', format: ColumnFormat.DATE },
  { label: 'Vàlid fins', key: 'validUntil', format: ColumnFormat.DATE },
  {
    label: 'Total',
    key: 'total',
    format: ColumnFormat.PRICE,
    align: ColumnnAlign.RIGHT,
  },
];

const FILTERS: Filters[] = [
  { label: 'Codi', key: 'code', format: FiltersFormat.TEXT },
  { label: 'Client', key: 'companyName', format: FiltersFormat.TEXT },
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
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [dateFilters, setDateFilters] = useState<DateFilters>(getDefaultDateRange);

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
        columns={COLUMNS}
        entity={EntityTable.ASSEMBLY_BUDGET}
        tableButtons={TABLE_BUTTONS}
        filters={FILTERS}
        totalCounts
      />
    </div>
  );
};
