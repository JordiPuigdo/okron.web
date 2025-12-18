'use client';

import { useEffect, useState } from 'react';
import { useHolidays } from 'app/hooks/useHolidays';
import { useTranslations } from 'app/hooks/useTranslations';
import { Holiday } from 'app/interfaces/Holiday';
import DataTable from 'components/table/DataTable';
import {
  Column,
  ColumnFormat,
  Filters,
  FiltersFormat,
  TableButtons,
} from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';

interface TableDataHolidaysProps {
  className?: string;
  title?: string;
  hideShadow?: boolean;
  onDelete?: (id: string) => void;
  onCreate?: () => void;
  onEdit?: (holiday: Holiday) => void;
  onRefreshRef?: (refresh: () => void) => void;
}

export const TableDataHolidays = ({
  className = '',
  title = '',
  hideShadow = false,
  onDelete,
  onCreate,
  onEdit,
  onRefreshRef,
}: TableDataHolidaysProps) => {
  const { t } = useTranslations();
  const { holidays, fetchHolidaysByYear, deleteHoliday } = useHolidays();
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  useEffect(() => {
    fetchHolidaysByYear(selectedYear);
  }, [selectedYear]);

  // Exponer función de refresh al padre
  useEffect(() => {
    if (onRefreshRef) {
      onRefreshRef(() => fetchHolidaysByYear(selectedYear));
    }
  }, [onRefreshRef, selectedYear]);

  const handleDelete = async (id: string) => {
    try {
      await deleteHoliday(id);
      if (onDelete) {
        onDelete(id);
      }
    } catch (error) {
      console.error('Error deleting holiday:', error);
    }
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };

  return (
    <div className="flex flex-col h-full gap-4 w-full">
      {title && <span className="font-semibold">{title}</span>}

      <div className={`flex gap-4 items-center ${className}`}>
        <label className="text-sm font-medium">
          {t('holidays.filter.year')}
        </label>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          className="p-2 border border-gray-300 rounded-md w-[150px]"
        >
          {generateYearOptions().map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        data={holidays}
        columns={columnsHolidays}
        entity={EntityTable.HOLIDAY}
        tableButtons={tableButtons}
        filters={filtersHolidays}
        onDelete={handleDelete}
        onEdit={onEdit}
        hideShadow={hideShadow}
      />
    </div>
  );
};

const tableButtons: TableButtons = {
  edit: true,
  delete: true,
};

const columnsHolidays: Column[] = [
  {
    label: 'ID',
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Nom',
    key: 'name',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Data',
    key: 'date',
    format: ColumnFormat.DATE,
  },
  {
    label: 'Any',
    key: 'year',
    format: ColumnFormat.TEXT,
  },
  {
    label: 'Descripció',
    key: 'description',
    format: ColumnFormat.TEXT,
  },
];

const filtersHolidays: Filters[] = [
  {
    label: 'Nom',
    key: 'name',
    format: FiltersFormat.TEXT,
  },
  {
    label: 'Descripció',
    key: 'description',
    format: FiltersFormat.TEXT,
  },
];
