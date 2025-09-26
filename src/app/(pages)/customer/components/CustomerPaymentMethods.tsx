'use client';

import { useState } from 'react';
import { get, useFormContext } from 'react-hook-form';
import { usePaymentMethods } from 'app/hooks/usePaymentMethod';

export const CustomerPaymentMethods = () => {
  const {
    paymentMethods: generalMethods,
    loading,
    error,
  } = usePaymentMethods();

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const paymentMethod = watch('paymentMethod');

  const [showGeneral, setShowGeneral] = useState(false);

  const [show, setShow] = useState(false);

  return (
    <div className="pt-4 space-y-4">
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
          {paymentMethod && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <div>
                <label>Descripció</label>
                <input
                  {...register('paymentMethod.description', {
                    required: 'La descripció és obligatòria',
                  })}
                  className="w-full border rounded p-2"
                  placeholder="Descripció"
                  disabled
                />
                {get(errors, 'paymentMethod.description') && (
                  <p className="text-red-500 text-sm">
                    {get(errors, 'paymentMethod.description.message')}
                  </p>
                )}
              </div>
              <div>
                <label>Dies</label>
                <input
                  {...register('paymentMethod.days', {
                    required: 'La descripció és obligatòria',
                  })}
                  className="w-full border rounded p-2"
                  placeholder="Dies"
                  disabled
                />
                {get(errors, 'paymentMethod.days') && (
                  <p className="text-red-500 text-sm">
                    {get(errors, 'paymentMethod.days.message')}
                  </p>
                )}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowGeneral(!showGeneral)}
            className="mt-4 text-green-600 hover:underline text-sm"
          >
            {showGeneral
              ? 'Amagar mètodes generals'
              : 'Mostrar mètodes generals'}
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
                  <div className="w-full">{method.description}</div>
                  <div className="w-full">{method.days}</div>
                  <button
                    type="button"
                    className="text-blue-600 hover:underline text-sm w-full text-right"
                    onClick={() =>
                      setValue('paymentMethod', {
                        id: method.id,
                        description: method.description,
                        days: method.days,
                      })
                    }
                  >
                    Afegir al client
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
