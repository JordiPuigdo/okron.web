'use client';

import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Customer } from 'app/interfaces/Customer';

import CustomerInstallationItem from './CustomerInstallationItem';

export default function CustomerInstallationList({
  customerId,
  customer,
}: {
  customerId: string;
  customer: Customer | undefined;
}) {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'installations',
  });

  const [show, setShow] = useState(false);
  return (
    <div className="space-y-4 pt-4">
      <div
        className="flex justify-between items-center bg-gray-100 rounded-xl p-2 hover:cursor-pointer"
        onClick={() => setShow(!show)}
      >
        <h3 className="text-md font-semibold text-gray-700">Botigues</h3>
      </div>

      {show && (
        <>
          {fields.map((field, index) => (
            <CustomerInstallationItem
              key={field.id}
              index={index}
              remove={remove}
              customerId={customerId}
              customer={customer ?? undefined}
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
                rates: [],
              })
            }
            className="text-blue-600 hover:underline text-sm"
          >
            + Afegir nova botiga
          </button>
        </>
      )}
    </div>
  );
}
