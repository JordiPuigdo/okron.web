'use client';

import { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { EditableTable } from 'app/(pages)/system/rates/components/EditableTable';
import { useRates } from 'app/hooks/useRates';
import { useTranslations } from 'app/hooks/useTranslations';
import { DayOfWeek, Rate } from 'app/interfaces/Rate';

import { RateField } from '../CustomerRatesManager';

export function InstallationRatesManager({ index }: { index: number }) {
  const { rates: generalRates, rateTypes, loading, fetchRates } = useRates();
  const { t } = useTranslations();

  const dayOfWeekLabels = {
    [DayOfWeek.Monday]: t('days.monday'),
    [DayOfWeek.Tuesday]: t('days.tuesday'),
    [DayOfWeek.Wednesday]: t('days.wednesday'),
    [DayOfWeek.Thursday]: t('days.thursday'),
    [DayOfWeek.Friday]: t('days.friday'),
    [DayOfWeek.Saturday]: t('days.saturday'),
    [DayOfWeek.Sunday]: t('days.sunday'),
  };

  const { control } = useFormContext();

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: `installations.${index}.rates`,
    keyName: 'id',
  });

  const [ratesSelected, setRatesSelected] = useState<RateField[]>([]);

  const addGeneralMethod = (method: any) => {
    onCreateRate(method);
    /*const exists = ratesSelected.find(r => r.type?.id === method.type.id);
    if (!exists) {
      append(method);
      setRatesSelected(prev => [...prev, method]);
    }*/
  };

  useEffect(() => {
    fetchRates();
  }, []);

  useEffect(() => {
    setRatesSelected(fields as unknown as RateField[]);
  }, [fields]);

  const onCreateRate = async (data: Rate) => {
    const rateType = rateTypes.find(rt => rt.id === data.rateTypeId);
    if (!rateType) return;

    const newRate: RateField = {
      ...data,
      rhfId: crypto.randomUUID(),
      type: rateType,
    };

    append(newRate);
    setRatesSelected(prev => [...prev, newRate]);
  };

  const onDelete = (id: string) => {
    const rateToRemove = ratesSelected.find(r => r.id === id);
    if (!rateToRemove) return;

    const indexToRemove = fields.findIndex(field => field.id === id);

    if (indexToRemove !== -1) {
      remove(indexToRemove);
      setRatesSelected(prev => prev.filter(r => r.id !== id));
    }
  };

  const onUpdate = async (
    id: string,
    newData: Partial<Rate>
  ): Promise<void> => {
    const rate = ratesSelected.find(r => r.id === id);
    if (!rate) return;

    const index = fields.findIndex(field => field.id === id);
    if (index !== -1) {
      update(index, { ...fields[index], ...newData });
      setRatesSelected(prev =>
        prev.map(r => (r.id === id ? { ...r, ...newData } : r))
      );
    }
  };

  const columns = [
    {
      header: t('rates.type'),
      accessor: (row: Rate) => {
        const rt = rateTypes.find(r => r.id === row.rateTypeId);
        return rt ? `${rt.code} - ${rt.description ?? ''}` : '';
      },
    },
    {
      header: t('rates.price'),
      accessor: 'price',
      editable: true,
      inputType: 'number',
      width: 'w-24',
    },
    {
      header: t('rates.days.of.week'),
      accessor: (row: Rate) =>
        row.daysOfWeek
          .sort((a, b) => a - b)
          .map(d => dayOfWeekLabels[d])
          .join(', '),
      editable: true,
      inputType: 'daysOfWeek',
    },
    {
      header: t('rates.start.time'),
      accessor: 'startTime',
      editable: true,
      inputType: 'time',
      width: 'w-24',
    },
    {
      header: t('rates.end.time'),
      accessor: 'endTime',
      editable: true,
      inputType: 'time',
      width: 'w-24',
    },
  ];

  return (
    <div className="space-y-6 rounded-xl p-4 mt-4">
      <section className="flex flex-col gap-4 border-2 border-green-200 rounded-lg p-4 bg-green-50">
        <EditableTable
          columns={columns}
          data={ratesSelected}
          onUpdate={onUpdate}
          onDelete={onDelete}
          loading={loading}
        />
      </section>

      <section>
        {generalRates
          .filter(
            rate => !ratesSelected.find(x => x.rateTypeId === rate.rateTypeId)
          )
          .map(rate => (
            <div
              key={rate.id}
              className="flex justify-between border p-2 rounded mb-2"
            >
              <div>
                <p>
                  <strong>{rate.type?.code}</strong>{' '}
                  <strong>{rate.type?.description}</strong> - {rate.price} €
                </p>
              </div>
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => addGeneralMethod(rate)}
              >
                {t('rates.add.to.store')}
              </button>
            </div>
          ))}
      </section>

      {/*<div className=" border-blue-200  bg-blue-50 rounded-xl">
        <RateForm
          rateTypes={rateTypes}
          isSubmit={false}
          onSubmit={onCreateRate}
        />
      </div>*/}
    </div>
  );
}
