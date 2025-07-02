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

export function CustomerRatesManager() {
  const {
    rates: generalRates,
    rateTypes,
    loading,

    fetchRates,
  } = useRates();

  const { control } = useFormContext();

  const { append } = useFieldArray({
    control,
    name: 'rates',
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

  const onCreateClientRate = async (data: Omit<Rate, 'id'>) => {
    const newRate: Rate = { ...data, id: crypto.randomUUID() };
    append(newRate);
    setRatesSelected(prev => [...prev, newRate]);
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

  const availableRates = generalRates;

  const onDelete = (id: string) => {
    setRatesSelected(prev => prev.filter(r => r.id !== id));
  };

  const onUpdate = async (
    id: string,
    newData: Partial<Rate>
  ): Promise<void> => {
    setRatesSelected(prev =>
      prev.map(r => (r.id === id ? { ...r, ...newData } : r))
    );
  };

  return (
    <div className="space-y-6 bg-gray-50 rounded-xl">
      <section>
        <h2 className="text-lg font-semibold">Tarifes del client</h2>
        <EditableTable
          columns={columns}
          data={ratesSelected}
          onUpdate={onUpdate}
          onDelete={onDelete}
          loading={loading}
        />
      </section>

      <section>
        {availableRates.map(rate => (
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
              Afegir a client
            </button>
          </div>
        ))}
      </section>

      <RateForm
        rateTypes={rateTypes}
        isSubmit={false}
        onSubmit={onCreateClientRate}
      />
    </div>
  );
}
