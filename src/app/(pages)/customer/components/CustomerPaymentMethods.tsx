'use client';

import { useState } from 'react';
import { get, useFieldArray, useFormContext } from 'react-hook-form';
import { usePaymentMethods } from 'app/hooks/usePaymentMethod';

export const CustomerPaymentMethods = () => {
  const {
    paymentMethods: generalMethods,
    loading,
    error,
  } = usePaymentMethods();

  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'paymentMethods',
  });

  const [showGeneral, setShowGeneral] = useState(false);
  const addGeneralMethod = (method: { id: string; description: string }) => {
    const exists = fields.some(f => f.id === method.id);
    if (!exists) {
      const newMethod = generalMethods.find(m => m.id === method.id);
      if (newMethod)
        append({ code: newMethod.code, description: method.description });
    }
  };

  const [show, setShow] = useState(false);

  return (
    <div className="space-y-4 pt-4">
      <div
        className="flex justify-between items-center bg-gray-100 rounded-xl p-2 hover:cursor-pointer"
        onClick={() => setShow(!show)}
      >
        <h3 className="text-md font-semibold text-gray-700">
          Mètodes de pagament
        </h3>
      </div>

      {show && (
        <>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 border-2 border-blue-200 rounded-lg p-4 bg-blue-50"
            >
              <div>
                <label>Codi</label>
                <input
                  {...register(`paymentMethods.${index}.code`, {
                    required: 'El codi és obligatori',
                  })}
                  className="w-full border rounded p-2"
                  placeholder="Codi"
                />
                {get(errors, `paymentMethods.${index}.code`) && (
                  <p className="text-red-500 text-sm">
                    {get(errors, `paymentMethods.${index}.code.message`)}
                  </p>
                )}
              </div>

              <div>
                <label>Descripció</label>
                <input
                  {...register(`paymentMethods.${index}.description`, {
                    required: 'La descripció és obligatòria',
                  })}
                  className="w-full border rounded p-2"
                  placeholder="Descripció"
                />
                {get(errors, `paymentMethods.${index}.description`) && (
                  <p className="text-red-500 text-sm">
                    {get(errors, `paymentMethods.${index}.description.message`)}
                  </p>
                )}
              </div>

              <div className="flex flex-col justify-between">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-600 text-sm self-end mt-6"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              append({ code: '', description: '', customerId: undefined })
            }
            className="text-blue-600 hover:underline text-sm"
          >
            + Afegir nou mètode manualment
          </button>

          {/*
      <button
        type="button"
        onClick={() => setShowGeneral(!showGeneral)}
        className="mt-4 text-green-600 hover:underline text-sm"
      >
        {showGeneral ? 'Amagar mètodes generals' : 'Mostrar mètodes generals'}
      </button>

      {showGeneral && (
        <div className="mt-2 border rounded p-4 max-h-48 overflow-auto">
          {loading && <p>Carregant mètodes...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {generalMethods.length === 0 && !loading && (
            <p>No hi ha mètodes generals.</p>
          )}

          {generalMethods.map(method => (
            <div
              key={method.id}
              className="flex justify-between items-center border-b py-2"
            >
              <div>
                <strong>{method.code}</strong> - {method.description}
              </div>
              <button
                type="button"
                className="text-blue-600 hover:underline text-sm"
                onClick={() => addGeneralMethod(method)}
              >
                Afegir al client
              </button>
            </div>
          ))}
        </div>
      )}
      */}
        </>
      )}
    </div>
  );
};
