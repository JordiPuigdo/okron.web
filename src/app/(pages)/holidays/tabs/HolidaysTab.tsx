'use client';

import { useTranslations } from 'app/hooks/useTranslations';
import { HeaderTable } from 'components/layout/HeaderTable';

import { TableDataHolidays } from '../components/TableDataHolidays';

interface Props {
  onCreate: () => void;
  onEdit: (holiday: any) => void;
}

export function HolidaysTab({ onCreate, onEdit }: Props) {
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

      <TableDataHolidays onCreate={onCreate} />
    </div>
  );
}
