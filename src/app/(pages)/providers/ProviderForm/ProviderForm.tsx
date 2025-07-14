'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { SvgSpinner } from 'app/icons/icons';
import { Provider, UpdateProviderRequest } from 'app/interfaces/Provider';
import { Button } from 'designSystem/Button/Buttons';
import { useRouter } from 'next/navigation';

import { PAYMENT_METHODS } from './paymentMethod';

interface ProviderFormProps {
  providerData?: Provider;
  onSubmit: (data: UpdateProviderRequest) => void;
}

export default function ProviderForm({
  providerData,
  onSubmit,
}: ProviderFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProviderRequest>();

  useEffect(() => {
    if (providerData) {
      Object.keys(providerData).forEach(key => {
        if (key === 'active' || key === 'isVirtual') return;

        const value = providerData[key as keyof Provider];
        const formattedValue =
          typeof value === 'boolean'
            ? value.toString()
            : value instanceof Date
            ? value.toISOString()
            : value;
        setValue(key as keyof UpdateProviderRequest, formattedValue as string);
      });
      setValue('active', providerData.active);
      setValue('isVirtual', providerData.isVirtual);
    }
  }, [providerData, setValue]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col flex-1 space-y-4 p-4 border bg-white rounded-md"
    >
      <div>
        <label className="block font-medium">Nom</label>
        <input
          {...register('name', {
            required: 'El nombre es obligatorio',
          })}
          className="w-full border rounded p-2"
          placeholder="Nombre del proveedor"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label className="block font-medium">Nom Comercial</label>
        <input
          {...register('commercialName')}
          className="w-full border rounded p-2"
          placeholder="Nombre del proveedor"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block font-medium">NIE</label>
        <input
          {...register('nie')}
          className="w-full border rounded p-2"
          placeholder="NIE del proveeïdor"
        />
        {errors.nie && (
          <p className="text-red-500 text-sm">{errors.nie.message}</p>
        )}
      </div>

      <div>
        <label className="block font-medium">Direcció</label>
        <input
          {...register('address', {})}
          className="w-full border rounded p-2"
          placeholder="Direcció"
        />
        {errors.address && (
          <p className="text-red-500 text-sm">{errors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Ciutat</label>
          <input
            {...register('city', {})}
            className="w-full border rounded p-2"
            placeholder="Ciutat"
          />
          {errors.city && (
            <p className="text-red-500 text-sm">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Provincia</label>
          <input
            {...register('province', {})}
            className="w-full border rounded p-2"
            placeholder="Provincia"
          />
          {errors.province && (
            <p className="text-red-500 text-sm">{errors.province.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Codi Postal</label>
          <input
            {...register('postalCode', {})}
            className="w-full border rounded p-2"
            placeholder="Codi Postal"
          />
          {errors.postalCode && (
            <p className="text-red-500 text-sm">{errors.postalCode.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Telèfon</label>
          <input
            {...register('phoneNumber')}
            className="w-full border rounded p-2"
            placeholder="Telèfon"
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            {...register('email', {
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: 'Formato de email inválido',
              },
            })}
            className="w-full border rounded p-2"
            placeholder="Email"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">WhatsApp</label>
          <input
            {...register('whatsappNumber')}
            className="w-full border rounded p-2"
            placeholder="Número de WhatsApp"
          />
        </div>
      </div>
      <div>
        <label className="block font-medium">Número de compte</label>
        <input
          {...register('accountNumber')}
          className="w-full border rounded p-2"
          placeholder="Número de compte"
        />
      </div>

      <div>
        <label className="block font-medium">Mètode de pagament</label>
        <select
          {...register('paymentMethod')}
          className="w-full border rounded p-2"
        >
          {PAYMENT_METHODS.map(paymentMethod => (
            <option key={paymentMethod.id} value={paymentMethod.name}>
              {paymentMethod.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium">Virtual</label>
        <input
          {...register('isVirtual')}
          type="checkbox"
          onChange={e => setValue('isVirtual', e.target.checked ? true : false)}
        />
      </div>
      {providerData && (
        <div>
          <label className="block font-medium">Estat del proveïdor</label>
          <input
            {...register('active')}
            type="checkbox"
            checked={providerData?.active}
            onChange={e => setValue('active', e.target.checked ? true : false)}
          />
        </div>
      )}
      <div className="flex flex-1 justify-end gap-4 items-end border-t pt-4">
        <Button
          type="create"
          customStyles="gap-2 flex"
          disabled={isSubmitting}
          onClick={handleSubmit(onSubmit)}
        >
          {providerData ? 'Actualitzar' : 'Crear Proveïdor'}
          {isSubmitting && <SvgSpinner />}
        </Button>
        <Button
          type="cancel"
          onClick={() => router.back()}
          customStyles="gap-2 flex"
          disabled={isSubmitting}
        >
          Cancelar {isSubmitting && <SvgSpinner />}
        </Button>
      </div>
    </form>
  );
}
