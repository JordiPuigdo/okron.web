'use client';

import { useEffect, useMemo, useState } from 'react';
import { useBillingSummary } from 'app/hooks/useBillingSummary';
import { useTranslations } from 'app/hooks/useTranslations';
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

const TABLE_BUTTONS: TableButtons = {};

const getColumns = (t: (key: string) => string): Column[] => [
  { label: 'ID', key: 'id', format: ColumnFormat.TEXT },
  { label: t('type'), key: 'type', format: ColumnFormat.TEXT },
  { label: t('date'), key: 'date', format: ColumnFormat.DATE },
  { label: t('code'), key: 'code', format: ColumnFormat.TEXT },
  { label: t('tax.id'), key: 'nif', format: ColumnFormat.TEXT },
  { label: t('customer'), key: 'companyName', format: ColumnFormat.TEXT },
  { label: t('billingSummary.taxableBase21'), key: 'base21', format: ColumnFormat.PRICE, align: ColumnnAlign.RIGHT },
  { label: t('billingSummary.taxableBase10'), key: 'base10', format: ColumnFormat.PRICE, align: ColumnnAlign.RIGHT },
  { label: t('billingSummary.noTax'), key: 'baseNoTax', format: ColumnFormat.PRICE, align: ColumnnAlign.RIGHT },
  { label: t('billingSummary.iva21'), key: 'iva21', format: ColumnFormat.PRICE, align: ColumnnAlign.RIGHT },
  { label: t('billingSummary.iva10'), key: 'iva10', format: ColumnFormat.PRICE, align: ColumnnAlign.RIGHT },
  { label: t('total'), key: 'total', format: ColumnFormat.PRICE, align: ColumnnAlign.RIGHT },
];

const getFilters = (t: (key: string) => string): Filters[] => [
  { label: t('type'), key: 'type', format: FiltersFormat.TEXT },
  { label: t('code'), key: 'code', format: FiltersFormat.TEXT },
  { label: t('tax.id'), key: 'nif', format: FiltersFormat.TEXT },
  { label: t('customer'), key: 'companyName', format: FiltersFormat.TEXT },
];

function getDefaultDateRange(): DateFilters {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);
  return { startDate, endDate };
}

interface TableDataBillingSummaryProps {
  className?: string;
}

export const TableDataBillingSummary = ({
  className = '',
}: TableDataBillingSummaryProps) => {
  const { summaryItems, isLoading, fetchBillingSummary } =
    useBillingSummary();
  const { t } = useTranslations();
  const [firstLoad, setFirstLoad] = useState(true);
  const [dateFilters, setDateFilters] = useState<DateFilters>(getDefaultDateRange);
  const [message, setMessage] = useState<string>('');

  const columns = useMemo(() => getColumns(t), [t]);
  const filters = useMemo(() => getFilters(t), [t]);

  useEffect(() => {
    fetchData();
    setFirstLoad(false);
  }, []);

  useEffect(() => {
    if (dateFilters.startDate && dateFilters.endDate && !firstLoad) {
      fetchData();
    }
  }, [dateFilters]);

  const fetchData = async () => {
    if (!dateFilters.startDate || !dateFilters.endDate) return;

    await fetchBillingSummary({
      startDate: dateFilters.startDate.toISOString(),
      endDate: dateFilters.endDate.toISOString(),
    });
  };

  useEffect(() => {
    if (summaryItems.length === 0 && !firstLoad && !isLoading) {
      setMessage(t('billingSummary.noResults'));
      setTimeout(() => setMessage(''), 5000);
    }
  }, [summaryItems]);

  return (
    <div className="flex flex-col h-full gap-4 w-full">
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
        data={summaryItems}
        columns={columns}
        entity={EntityTable.BILLINGSUMMARY}
        tableButtons={TABLE_BUTTONS}
        filters={filters}
        totalCounts
        isLoading={isLoading}
        enableCurrencyFormat
      />
    </div>
  );
};
