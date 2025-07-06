'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';

import CustomerInstallationItem from './CustomerInstallationItem';

export default function CustomerInstallationList() {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'installations',
  });

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-md font-semibold text-gray-700">Botigues</h3>

      {fields.map((field, index) => (
        <CustomerInstallationItem
          key={field.id}
          index={index}
          remove={remove}
        />
      ))}

      <button
        type="button"
        onClick={() =>
          append({
            code: '',
            address: {
              address: '',
              city: '',
              country: '',
              postalCode: '',
              isPrimary: false,
            },
            contact: [],
          })
        }
        className="text-blue-600 hover:underline text-sm"
      >
        + Afegir nova botiga
      </button>
    </div>
  );
}
