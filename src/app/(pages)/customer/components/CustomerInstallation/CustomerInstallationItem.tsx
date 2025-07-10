'use client';

import { useState } from 'react';
import { get, useFieldArray, useFormContext } from 'react-hook-form';

import { InstallationRatesManager } from './InstallationsRateManager';

export default function CustomerInstallationItem({
  index,
  remove,
}: {
  index: number;
  remove: (index: number) => void;
}) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  const {
    fields,
    append,
    remove: removeContact,
  } = useFieldArray({
    control,
    name: `installations.${index}.contact`,
  });

  const installationId = get(
    control._formValues,
    `installations.${index}.rates`
  );

  const [showContacts, setShowContacts] = useState<boolean>(false);
  const [showRates, setShowRates] = useState<boolean>(false);

  return (
    <div className="grid grid-cols-1 gap-4 border p-4 rounded">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>Codi</label>
          <input
            {...register(`installations.${index}.code`, {
              required: 'El codi de la botiga és obligatori',
            })}
            className="w-full border rounded p-2"
            placeholder="Codi botiga"
          />
          {get(errors, `installations.${index}.code`) && (
            <p className="text-red-500 text-sm">
              {get(errors, `installations.${index}.code.message`)}
            </p>
          )}
        </div>

        <div>
          <label>Adreça</label>
          <input
            {...register(`installations.${index}.address.address`, {
              required: "L'adreça és obligatòria",
            })}
            className="w-full border rounded p-2"
            placeholder="Adreça"
          />
        </div>
        <div>
          <label>Ciutat</label>
          <input
            {...register(`installations.${index}.address.city`, {
              required: 'La ciutat és obligatòria',
            })}
            className="w-full border rounded p-2"
            placeholder="Ciutat"
          />
        </div>
        <div>
          <label>País</label>
          <input
            {...register(`installations.${index}.address.country`, {
              required: 'El país és obligatori',
            })}
            className="w-full border rounded p-2"
            placeholder="País"
          />
        </div>
        <div>
          <label>Codi postal</label>
          <input
            {...register(`installations.${index}.address.postalCode`, {
              required: 'El codi postal és obligatori',
            })}
            className="w-full border rounded p-2"
            placeholder="Codi postal"
          />
        </div>
      </div>

      <div>
        <div
          className="flex justify-between items-center bg-gray-100 rounded-xl p-2 hover:cursor-pointer"
          onClick={() => setShowContacts(!showContacts)}
        >
          <h3 className="text-md font-semibold text-gray-700">Contactes</h3>
          <div className="font-semibold">{fields.length}</div>
        </div>

        {showContacts && (
          <>
            {fields.map((contact, cIndex) => (
              <div
                key={contact.id}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 border-blue-200 rounded-lg p-4 bg-blue-50 mt-2"
              >
                <div>
                  <label>Nom</label>
                  <input
                    {...register(
                      `installations.${index}.contact.${cIndex}.name`,
                      {
                        required: 'Nom obligatori',
                      }
                    )}
                    className="w-full border rounded p-2"
                    placeholder="Nom"
                  />
                </div>
                <div>
                  <label>Email</label>
                  <input
                    {...register(
                      `installations.${index}.contact.${cIndex}.email`,
                      {
                        required: 'Email obligatori',
                      }
                    )}
                    className="w-full border rounded p-2"
                    placeholder="Email"
                  />
                </div>
                <div>
                  <label>Telèfon</label>
                  <input
                    {...register(
                      `installations.${index}.contact.${cIndex}.phone`,
                      {
                        required: 'Telèfon obligatori',
                      }
                    )}
                    className="w-full border rounded p-2"
                    placeholder="Telèfon"
                  />
                </div>
                <div>
                  <label>Descripció</label>
                  <input
                    {...register(
                      `installations.${index}.contact.${cIndex}.description`
                    )}
                    className="w-full border rounded p-2"
                    placeholder="Descripció"
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeContact(cIndex)}
                    className="text-red-600 text-sm"
                  >
                    Eliminar contacte
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                append({ name: '', email: '', phone: '', description: '' })
              }
              className="text-blue-600 hover:underline text-sm mt-2"
            >
              + Afegir contacte
            </button>
          </>
        )}
      </div>

      <div
        className="flex justify-between items-center bg-gray-100 rounded-xl p-2 hover:cursor-pointer"
        onClick={() => setShowRates(!showRates)}
      >
        <h3 className="text-md font-semibold text-gray-700">Tarifes</h3>
        <div className="font-semibold">{installationId.length}</div>
      </div>

      {showRates && <InstallationRatesManager index={index} />}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => remove(index)}
          className="text-red-600 text-sm"
        >
          Eliminar Botiga
        </button>
      </div>
    </div>
  );
}
