'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import { Provider, UpdateProviderRequest } from 'app/interfaces/Provider';
import { Textarea } from 'components/textarea';
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
  const { t } = useTranslations();
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
        <label className="block font-medium">{t('name')}</label>
        <input
          {...register('name', {
            required: t('validation.name.required'),
          })}
          className="w-full border rounded p-2"
          placeholder={t('provider.name.placeholder')}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label className="block font-medium">{t('commercial.name')}</label>
        <input
          {...register('commercialName')}
          className="w-full border rounded p-2"
          placeholder={t('provider.commercial.name.placeholder')}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block font-medium">{t('nie')}</label>
        <input
          {...register('nie')}
          className="w-full border rounded p-2"
          placeholder={t('provider.nie.placeholder')}
        />
        {errors.nie && (
          <p className="text-red-500 text-sm">{errors.nie.message}</p>
        )}
      </div>

      <div>
        <label className="block font-medium">{t('address')}</label>
        <input
          {...register('address', {})}
          className="w-full border rounded p-2"
          placeholder={t('address')}
        />
        {errors.address && (
          <p className="text-red-500 text-sm">{errors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">{t('city')}</label>
          <input
            {...register('city', {})}
            className="w-full border rounded p-2"
            placeholder={t('city')}
          />
          {errors.city && (
            <p className="text-red-500 text-sm">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">{t('province')}</label>
          <input
            {...register('province', {})}
            className="w-full border rounded p-2"
            placeholder={t('province')}
          />
          {errors.province && (
            <p className="text-red-500 text-sm">{errors.province.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">{t('postal.code')}</label>
          <input
            {...register('postalCode', {})}
            className="w-full border rounded p-2"
            placeholder={t('postal.code')}
          />
          {errors.postalCode && (
            <p className="text-red-500 text-sm">{errors.postalCode.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">{t('phone')}</label>
          <input
            {...register('phoneNumber')}
            className="w-full border rounded p-2"
            placeholder={t('phone')}
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">{t('email')}</label>
          <input
            type="email"
            {...register('email', {
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: t('validation.email.invalid'),
              },
            })}
            className="w-full border rounded p-2"
            placeholder={t('email')}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">{t('whatsapp')}</label>
          <input
            {...register('whatsappNumber')}
            className="w-full border rounded p-2"
            placeholder={t('whatsapp.number.placeholder')}
          />
        </div>
      </div>
      <div>
        <label className="block font-medium">{t('account.number')}</label>
        <input
          {...register('accountNumber')}
          className="w-full border rounded p-2"
          placeholder={t('account.number')}
        />
      </div>

      <div>
        <label className="block font-medium">{t('payment.method')}</label>
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
        <label className="block font-medium">{t('comments')}</label>
        <Textarea
          {...register('comments')}
          className="w-full border rounded p-2"
          placeholder={t('comments')}
        />
      </div>

      <div>
        <label className="block font-medium">{t('virtual')}</label>
        <input
          {...register('isVirtual')}
          type="checkbox"
          onChange={e => setValue('isVirtual', e.target.checked ? true : false)}
        />
      </div>
      {providerData && (
        <div>
          <label className="block font-medium">{t('provider.status')}</label>
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
          {providerData ? t('update') : t('create.provider')}
          {isSubmitting && <SvgSpinner />}
        </Button>
        <Button
          type="cancel"
          onClick={() => router.back()}
          customStyles="gap-2 flex"
          disabled={isSubmitting}
        >
          {t('cancel')} {isSubmitting && <SvgSpinner />}
        </Button>
      </div>
    </form>
  );
}
