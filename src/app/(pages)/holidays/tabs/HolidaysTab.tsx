'use client';

import { useTranslations } from 'app/hooks/useTranslations';
import { HeaderTable } from 'components/layout/HeaderTable';

import { TableDataHolidays } from '../components/TableDataHolidays';

interface Props {
  onCreate: () => void;
  onEdit: (holiday: any) => void;
  onRefreshRef?: (refresh: () => void) => void;
}

export function HolidaysTab({ onCreate, onEdit, onRefreshRef }: Props) {
  const { t } = useTranslations();

  return (
    <div className="flex flex-col h-full">
      <HeaderTable
        title={t('holidays.title')}
        subtitle={`${t('start')} - ${t('holidays.list')}`}
        createButton={t('holidays.create')}
        urlCreateButton=""
        onCreate={onCreate}
      />

      <TableDataHolidays
        onCreate={onCreate}
        onEdit={onEdit}
        onRefreshRef={onRefreshRef}
      />
    </div>
  );
}
