import { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { EditableTable } from 'app/(pages)/system/rates/components/EditableTable';
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
    keyName: 'id',
  });

  const [show, setShow] = useState(false);

  const [ratesSelected, setRatesSelected] = useState<RateField[]>([]);

  const addGeneralMethod = (method: any) => {
    onCreateClientRate(method);
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
      editable: false,
      inputType: 'daysOfWeek',
    },
    {
      header: "Hora d'inici",
      accessor: 'startTime',
      editable: false,
      inputType: 'time',
      width: 'w-24',
    },
    {
      header: 'Hora de fi',
      accessor: 'endTime',
      editable: false,
      inputType: 'time',
      width: 'w-24',
    },
  ];

  const availableRates = generalRates;

  const onDelete = (id: string) => {
    const index = rateFields.findIndex(field => field.id === id);
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

    const index = rateFields.findIndex(field => field.id === id);
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
        <div className="font-semibold">{ratesSelected.length}</div>
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

          <ul className="flex flex-col justify-between w-full">
            {availableRates
              .filter(
                rate => !ratesSelected.find(x => x.rateTypeId == rate.type!.id)
              )
              .map(rate => (
                <li key={rate.id} className="p-2 flex justify-between border">
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
                </li>
              ))}
          </ul>

          {/* <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
            <RateForm
              rateTypes={rateTypes}
              isSubmit={false}
              onSubmit={onCreateClientRate}
            />
          </div>*/}
        </>
      )}
    </div>
  );
}
