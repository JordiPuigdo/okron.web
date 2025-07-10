'use client';

import { useRates } from 'app/hooks/useRates';

import { EditableTable } from '../EditableTable';
import { RateTypeForm } from './RateTypeForm';

export default function RateTypeManager() {
  const { rateTypes, createRateType, updateRateType, deleteRateType, loading } =
    useRates();

  const columns: {
    header: string;
    accessor: keyof (typeof rateTypes)[number];
    editable: boolean;
    inputType: string;
    width?: string;
  }[] = [
    {
      header: 'Códi',
      accessor: 'code',
      editable: true,
      inputType: 'text',
      width: 'w-32',
    },
    {
      header: 'Descripció',
      accessor: 'description',
      editable: true,
      inputType: 'text',
    },
  ];

  const handleCreate = async (data: { code: string; description: string }) => {
    if (rateTypes.find(rt => rt.code === data.code)) return;

    await createRateType({
      code: data.code,
      description: data.description,
      active: true,
      creationDate: new Date(),
    });
  };

  const handleUpdate = async (
    id: string,
    data: Partial<(typeof rateTypes)[number]>
  ) => {
    const existing = rateTypes.find(rt => rt.id === id);
    if (!existing) return;

    await updateRateType({
      id,
      code: data.code ?? existing.code,
      description: data.description ?? existing.description,
      creationDate: data.creationDate ?? existing.creationDate,
      active: data.active ?? existing.active,
    });
  };

  const handleDelete = (id: string) => {
    deleteRateType(id);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-semibold mb-4">Nou tipus de tarifa</h2>
        <RateTypeForm onSubmit={handleCreate} loading={loading} />
      </div>

      <div className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-semibold mb-4">
          Tipus de Tarifes existents
        </h2>
        {rateTypes.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No s'han trobat registres creats.
          </p>
        ) : (
          <EditableTable
            columns={columns}
            data={rateTypes.sort((a, b) => a.code.localeCompare(b.code))}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
