'use client';

import { SvgIcon } from '@mui/material';
import { useRates } from 'app/hooks/useRates';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import { DayOfWeek, Rate } from 'app/interfaces/Rate';
import { formatTime } from 'app/utils/utils';

import { EditableTable } from '../EditableTable';
import { RateForm } from './RateForm';

export default function RateConfigurationPage() {
  const { t } = useTranslations();
  
  const dayOfWeekLabels = {
    [DayOfWeek.Monday]: t('system.rates.monday'),
    [DayOfWeek.Tuesday]: t('system.rates.tuesday'),
    [DayOfWeek.Wednesday]: t('system.rates.wednesday'),
    [DayOfWeek.Thursday]: t('system.rates.thursday'),
    [DayOfWeek.Friday]: t('system.rates.friday'),
    [DayOfWeek.Saturday]: t('system.rates.saturday'),
    [DayOfWeek.Sunday]: t('system.rates.sunday'),
  };
  const {
    rates,
    rateTypes,
    loading,
    error,
    createRate,
    updateRate,
    deleteRate,
  } = useRates();

  const columns = [
    {
      header: t('system.rates.rateType'),
      accessor: (row: Rate) => {
        const rt = rateTypes.find(r => r.id === row.rateTypeId);
        return rt ? `${rt.code} - ${rt.description ?? ''}` : '';
      },
    },
    {
      header: t('price'),
      accessor: 'price',
      editable: true,
      inputType: 'number',
      width: 'w-24',
    },
    {
      header: t('system.rates.weekDays'),
      accessor: (row: Rate) =>
        row.daysOfWeek
          .sort((a, b) => a - b)
          .map(d => dayOfWeekLabels[d])
          .join(', '),
      editable: true,
      inputType: 'daysOfWeek',
    },
    {
      header: t('system.rates.startTime'),
      accessor: 'startTime',
      editable: true,
      inputType: 'time',
      width: 'w-24',
    },
    {
      header: t('system.rates.endTime'),
      accessor: 'endTime',
      editable: true,
      inputType: 'time',
      width: 'w-24',
    },
  ];

  const isLoading = loading;
  const handleUpdate = async (id: string, newData: Partial<Rate>) => {
    const toSave = { ...newData };
    if (typeof toSave.daysOfWeek === 'string') {
      // "Dilluns,Dimarts" => [0,1] por ejemplo
      const daysStr = toSave.daysOfWeek as string;
      const daysArr = daysStr
        .split(',')
        .map(s => s.trim().toLowerCase())
        .map(s => {
          // Mapear etiqueta a número enum
          for (const key in dayOfWeekLabels) {
            if (
              dayOfWeekLabels[key as unknown as DayOfWeek].toLowerCase() === s
            ) {
              return Number(key);
            }
          }
          return null;
        })
        .filter((v): v is number => v !== null);

      toSave.daysOfWeek = daysArr;
    }

    if (toSave.price !== undefined) {
      toSave.price = Number(toSave.price);
    }

    if (toSave.startTime) {
      toSave.startTime = formatTime(toSave.startTime as string);
    }

    if (toSave.endTime) {
      toSave.endTime = formatTime(toSave.endTime as string);
    }

    await updateRate(id, toSave);
  };

  const handleCreate = async (data: Omit<Rate, 'id'>) => {
    const exists = rates.find(r => r.type?.id === data.rateTypeId);
    if (exists) {
      alert(t('system.rates.alreadyExists'));
      return;
    }
    await createRate(data);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-semibold mb-4">
          {t('system.rates.generalConfiguration')}
        </h2>
        <RateForm rateTypes={rateTypes} onSubmit={handleCreate} />
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <SvgSpinner className="w-5 h-5 animate-spin" />
        </div>
      )}

      {!isLoading && (
        <div className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4">
            {t('system.rates.existingRates')}
          </h2>
          {error !== null && (
            <div className="flex items-center gap-2 text-red-500">
              <SvgIcon name="alert-triangle" className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}
          <EditableTable
            columns={columns}
            data={rates}
            onUpdate={handleUpdate}
            onDelete={deleteRate}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}
