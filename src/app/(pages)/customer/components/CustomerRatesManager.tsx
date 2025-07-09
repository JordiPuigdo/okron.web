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
export interface RateField extends Rate {
  rhfId: string;
}

export function CustomerRatesManager({ customerId }: { customerId: string }) {
  const {
    rates: generalRates,
    rateTypes,
    loading,

    fetchRates,
  } = useRates();

  const { control } = useFormContext();

  const {
    fields: rateFields,
    append,
    update,
    remove,
  } = useFieldArray({
    control,
    name: 'rates',
    keyName: '_id',
  });

  const [show, setShow] = useState(false);

  const [ratesSelected, setRatesSelected] = useState<RateField[]>([]);
  const { createRate, updateRate, deleteRate } = useRates();

  const addGeneralMethod = (method: any) => {
    const exists = ratesSelected.find(r => r.type?.id === method.type.id);
    if (!exists) {
      append(method);
      setRatesSelected(prev => [...prev, method]);
    }
  };
  useEffect(() => {
    const loadData = async () => {
      await fetchRates();
      if (rateFields.length > 0) {
        const parsedRates: RateField[] = rateFields.map((field: any) => ({
          rhfId: field._id,
          id: field.id,
          price: Number(field.price),
          daysOfWeek: Array.isArray(field.daysOfWeek)
            ? field.daysOfWeek.map(Number)
            : [],
          startTime: field.startTime,
          endTime: field.endTime,
          rateTypeId: field.rateTypeId,
          type: field.type,
          active: field.active ?? true,
          creationDate: field.creationDate ?? new Date().toISOString(),
          customerId: field.customerId,
        }));

        setRatesSelected(parsedRates);
      }
    };

    loadData();
  }, [rateFields]);

  const onCreateClientRate = async (data: Omit<Rate, 'id'>) => {
    const newRate: RateField = { ...data, id: '', rhfId: crypto.randomUUID() };

    if (customerId) {
      const rate = await createRate({
        daysOfWeek: data.daysOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        rateTypeId: data.rateTypeId,
        type: data.type,
        active: data.active,
        creationDate: data.creationDate,
        customerId: customerId,
        price: data.price,
      });
      newRate.id = rate.id;
      newRate.customerId = customerId;
    }

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
    const guidId = ratesSelected.find(field => field.id === id)?.rhfId;
    const index = rateFields.findIndex(field => field._id === guidId);
    if (index === -1) return;

    remove(index);
    setRatesSelected(prev => prev.filter(r => r.id !== id));
  };

  const onUpdate = async (
    id: string,
    newData: Partial<Rate>
  ): Promise<void> => {
    if (!ratesSelected || ratesSelected.length === 0) {
      console.error('ratesSelected no está cargado aún');
      return;
    }

    const guidId = ratesSelected.find(field => field.id === id)?.rhfId;
    const index = rateFields.findIndex(field => field._id === guidId);
    if (index === -1) return;

    update(index, { ...rateFields[index], ...newData });

    setRatesSelected(prev =>
      prev.map(r => (r.id === id ? { ...r, ...newData } : r))
    );
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <div
        className="flex justify-between items-center bg-gray-100 rounded-xl p-2 hover:cursor-pointer"
        onClick={() => setShow(!show)}
      >
        <h3 className="text-md font-semibold text-gray-700">Tarifes</h3>
      </div>

      {show && (
        <>
          <section className="flex flex-col gap-4 border-2 border-green-200 rounded-lg p-4 bg-green-50">
            <h2 className="text-lg font-semibold">Configurades</h2>
            <EditableTable
              columns={columns}
              data={ratesSelected}
              onUpdate={onUpdate}
              onDelete={onDelete}
              loading={loading}
            />
          </section>

          <section className="flex border-t-2 border-gray-50 ">
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

          <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
            <RateForm
              rateTypes={rateTypes}
              isSubmit={false}
              onSubmit={onCreateClientRate}
            />
          </div>
        </>
      )}
    </div>
  );
}
