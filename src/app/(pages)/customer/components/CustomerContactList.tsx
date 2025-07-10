'use client';

import { useState } from 'react';
import { get, useFieldArray, useFormContext } from 'react-hook-form';

export const CustomerContactList = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contacts',
  });

  const [showContacts, setShowContacts] = useState(false);

  return (
    <div className="space-y-4 border-t pt-4">
      <div
        className="flex justify-between items-center bg-gray-100 rounded-xl p-2 hover:cursor-pointer"
        onClick={() => setShowContacts(!showContacts)}
      >
        <h3 className="text-md font-semibold text-gray-700">Contactes</h3>
        <div className="font-semibold">{fields.length}</div>
      </div>

      {showContacts && (
        <>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 border-blue-200 rounded-lg p-4 bg-blue-50"
            >
              <div>
                <label>Nom</label>
                <input
                  {...register(`contacts.${index}.name`, {
                    required: 'El nom és obligatori',
                  })}
                  className="w-full border rounded p-2"
                  placeholder="Nom"
                />
                {get(errors, `contacts.${index}.name`) && (
                  <p className="text-red-500 text-sm">
                    {get(errors, `contacts.${index}.name.message`)}
                  </p>
                )}
              </div>

              <div>
                <label>Email</label>
                <input
                  type="email"
                  {...register(`contacts.${index}.email`, {
                    required: "L'email és obligatori",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Format d'email incorrecte",
                    },
                  })}
                  className="w-full border rounded p-2"
                  placeholder="email@exemple.com"
                />
                {get(errors, `contacts.${index}.email`) && (
                  <p className="text-red-500 text-sm">
                    {get(errors, `contacts.${index}.email.message`)}
                  </p>
                )}
              </div>

              <div>
                <label>Telèfon</label>
                <input
                  {...register(`contacts.${index}.phone`)}
                  className="w-full border rounded p-2"
                  placeholder="Telèfon"
                />
              </div>

              <div>
                <label>Descripció</label>
                <input
                  {...register(`contacts.${index}.description`)}
                  className="w-full border rounded p-2"
                  placeholder="Descripció"
                />
              </div>

              <div className="col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => remove(index)}
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
              append({
                name: '',
                email: '',
                phone: '',
                description: '',
              })
            }
            className="text-blue-600 hover:underline text-sm"
          >
            + Afegir nou contacte
          </button>
        </>
      )}
    </div>
  );
};
