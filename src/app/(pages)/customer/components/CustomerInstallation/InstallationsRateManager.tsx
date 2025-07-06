'use client';

import { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { EditableTable } from 'app/(pages)/system/rates/components/EditableTable';
import { RateForm } from 'app/(pages)/system/rates/components/Rate/RateForm';
import { useRates } from 'app/hooks/useRates';
import { DayOfWeek, Rate } from 'app/interfaces/Rate';

const dayOfWeekLabels = {
  [DayOfWeek.Monday]: 'Dilluns',
  [DayOfWeek.Tuesday]: 'Dimarts',
  [DayOfWeek.Wednesday]: 'Dimecres',
  [DayOfWeek.Thursday]: 'Dijous',
  [DayOfWeek.Friday]: 'Divendres',
  [DayOfWeek.Saturday]: 'Dissabte',
  [DayOfWeek.Sunday]: 'Diumenge',
};

export function InstallationRatesManager({ index }: { index: number }) {
  const { rates: generalRates, rateTypes, loading, fetchRates } = useRates();

  const { control } = useFormContext();

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: `installations.${index}.rates`,
  });

  const [ratesSelected, setRatesSelected] = useState<Rate[]>([]);

  const addGeneralMethod = (method: any) => {
    const exists = ratesSelected.find(r => r.type?.id === method.type.id);
    if (!exists) {
      append(method);
      setRatesSelected(prev => [...prev, method]);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  useEffect(() => {
    setRatesSelected(fields as Rate[]);
  }, [fields]);

  const onCreateRate = async (data: Omit<Rate, 'id'>) => {
    const rateType = rateTypes.find(rt => rt.id === data.rateTypeId);
    if (!rateType) return;
    const newRate: Rate = { ...data, id: crypto.randomUUID(), type: rateType };
    append(newRate);
    setRatesSelected(prev => [...prev, newRate]);
  };

  const onDelete = (id: string) => {
    const indexToRemove = fields.findIndex(r => r.id === id);
    if (indexToRemove !== -1) {
      remove(indexToRemove);
      setRatesSelected(prev => prev.filter(r => r.id !== id));
    }
  };

  const onUpdate = async (
    id: string,
    newData: Partial<Rate>
  ): Promise<void> => {
    const i = fields.findIndex(r => r.id === id);
    if (i !== -1) {
      update(i, { ...fields[i], ...newData });
      setRatesSelected(prev =>
        prev.map(r => (r.id === id ? { ...r, ...newData } : r))
      );
    }
  };

  const columns = [
    {
      header: 'Tipus tarifa',
      accessor: (row: Rate) => {
        const rt = rateTypes.find(r => r.id === row.rateTypeId);
        return rt ? `${rt.code} - ${rt.description ?? ''}` : '';
      },
    },
    {
      header: 'Preu',
      accessor: 'price',
      editable: true,
      inputType: 'number',
      width: 'w-24',
    },
    {
      header: 'Dies de la setmana',
      accessor: (row: Rate) =>
        row.daysOfWeek
          .sort((a, b) => a - b)
          .map(d => dayOfWeekLabels[d])
          .join(', '),
      editable: true,
      inputType: 'daysOfWeek',
    },
    {
      header: "Hora d'inici",
      accessor: 'startTime',
      editable: true,
      inputType: 'time',
      width: 'w-24',
    },
    {
      header: 'Hora de fi',
      accessor: 'endTime',
      editable: true,
      inputType: 'time',
      width: 'w-24',
    },
  ];

  return (
    <div className="space-y-6 bg-gray-50 rounded-xl p-4 mt-4">
      <h4 className="text-md font-semibold mb-2">Tarifes de la botiga</h4>

      <EditableTable
        columns={columns}
        data={ratesSelected}
        onUpdate={onUpdate}
        onDelete={onDelete}
        loading={loading}
      />

      <section>
        {generalRates.map(rate => (
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
              Afegir a botiga
            </button>
          </div>
        ))}
      </section>

      <RateForm
        rateTypes={rateTypes}
        isSubmit={false}
        onSubmit={onCreateRate}
      />
    </div>
  );
}
