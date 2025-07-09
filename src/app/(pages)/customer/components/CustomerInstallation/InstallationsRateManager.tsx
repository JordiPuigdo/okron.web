'use client';

import { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { EditableTable } from 'app/(pages)/system/rates/components/EditableTable';
import { RateForm } from 'app/(pages)/system/rates/components/Rate/RateForm';
import { useRates } from 'app/hooks/useRates';
import { DayOfWeek, Rate } from 'app/interfaces/Rate';

import { RateField } from '../CustomerRatesManager';

const dayOfWeekLabels = {
  [DayOfWeek.Monday]: 'Dilluns',
  [DayOfWeek.Tuesday]: 'Dimarts',
  [DayOfWeek.Wednesday]: 'Dimecres',
  [DayOfWeek.Thursday]: 'Dijous',
  [DayOfWeek.Friday]: 'Divendres',
  [DayOfWeek.Saturday]: 'Dissabte',
  [DayOfWeek.Sunday]: 'Diumenge',
};

export function InstallationRatesManager({
  index,
  customerInstallationId,
  customerId,
}: {
  index: number;
  customerInstallationId: string;
  customerId: string;
}) {
  const {
    rates: generalRates,
    rateTypes,
    loading,
    fetchRates,
    createRate,
    updateRate,
    deleteRate,
  } = useRates();

  const { control } = useFormContext();

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: `installations.${index}.rates`,
    keyName: '_id',
  });

  const [ratesSelected, setRatesSelected] = useState<RateField[]>([]);

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
    setRatesSelected(fields as unknown as RateField[]);
  }, [fields]);

  const onCreateRate = async (data: Omit<Rate, 'id'>) => {
    const rateType = rateTypes.find(rt => rt.id === data.rateTypeId);
    if (!rateType) return;

    const newRate: RateField = {
      ...data,
      id: '',
      rhfId: crypto.randomUUID(),
      type: rateType,
    };
    const rate = await createRate({
      daysOfWeek: data.daysOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      rateTypeId: data.rateTypeId,
      type: data.type,
      active: data.active,
      creationDate: data.creationDate,
      customerId: customerId,
      customerInstallationId: customerInstallationId,
      price: data.price,
    });

    newRate.id = rate.id;
    newRate.customerId = customerId;
    newRate.customerInstallationId = customerInstallationId;

    append(newRate);
    setRatesSelected(prev => [...prev, newRate]);
  };

  const onDelete = (id: string) => {
    const guidId = ratesSelected.find(field => field.id === id)?.rhfId;
    const index = fields.findIndex(field => field._id === guidId);

    if (index !== -1) {
      remove(index);
      setRatesSelected(prev => prev.filter(r => r.id !== id));
    }
  };

  const onUpdate = async (
    id: string,
    newData: Partial<Rate>
  ): Promise<void> => {
    const guidId = ratesSelected.find(field => field.id === id)?.rhfId;
    const index = fields.findIndex(field => field._id === guidId);
    if (index !== -1) {
      update(index, { ...fields[index], ...newData });
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

      <div className=" border-blue-200  bg-blue-50 rounded-xl">
        <RateForm
          rateTypes={rateTypes}
          isSubmit={false}
          onSubmit={onCreateRate}
        />
      </div>
    </div>
  );
}
