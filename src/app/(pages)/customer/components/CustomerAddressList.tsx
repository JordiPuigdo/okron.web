'use client';

import { useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

export const CustomerAddressList = () => {
  const [showAddresses, setShowAddresses] = useState(false);

  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'address',
  });

  return (
    <div className="space-y-4 border-t pt-4">
      <div
        className="flex justify-between items-center bg-gray-100 rounded-xl p-2 hover:cursor-pointer"
        onClick={() => setShowAddresses(prev => !prev)}
      >
        <h3 className="text-md font-semibold text-gray-700">Direccions</h3>
      </div>

      {showAddresses && (
        <>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded border-2 border-blue-200 rounded-lg p-4 bg-blue-50 "
            >
              <div>
                <label>Adreça</label>
                <input
                  {...register(`address.${index}.address`)}
                  className="w-full border rounded p-2"
                  placeholder="Carrer i número"
                />
              </div>
              <div>
                <label>Ciutat</label>
                <input
                  {...register(`address.${index}.city`)}
                  className="w-full border rounded p-2"
                  placeholder="Ciutat"
                />
              </div>
              <div>
                <label>País</label>
                <input
                  {...register(`address.${index}.country`)}
                  className="w-full border rounded p-2"
                  placeholder="País"
                />
              </div>
              <div>
                <label>Codi Postal</label>
                <input
                  {...register(`address.${index}.postalCode`)}
                  className="w-full border rounded p-2"
                  placeholder="Codi Postal"
                />
              </div>
              <div className="col-span-2 flex justify-between items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register(`address.${index}.isPrimary`)}
                  />
                  Direcció principal
                </label>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-600 text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              append({
                address: '',
                city: '',
                country: '',
                postalCode: '',
                isPrimary: false,
              })
            }
            className="text-blue-600 hover:underline text-sm"
          >
            + Afegir nova direcció
          </button>
        </>
      )}
    </div>
  );
};
