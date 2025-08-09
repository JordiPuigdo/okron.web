import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useConfig } from 'app/hooks/useConfig';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import Company from 'app/interfaces/Company';
import { ErrorMessage } from 'components/Alerts/ErrorMessage';
import { SuccessfulMessage } from 'components/Alerts/SuccesfullMessage';

export default function CompanyComponent() {
  const { config, updateCompany, success } = useConfig();
  const { t } = useTranslations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Company>();

  useEffect(() => {
    if (config) {
      reset(config.company);
    }
  }, [config, reset]);

  const onSubmit = async (data: Company) => {
    await updateCompany(data);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4">{t('company.editTitle')}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            placeholder={t('company.name.placeholder')}
            {...register('name', { required: true })}
            className="w-full border border-gray-300 p-2 rounded"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{t('company.name.required')}</p>
          )}
        </div>

        <div>
          <input
            placeholder={t('company.email.placeholder')}
            {...register('email', {
              required: true,
              pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            })}
            className="w-full border border-gray-300 p-2 rounded"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">
              {t('company.email.required')}
            </p>
          )}
        </div>

        <div>
          <input
            placeholder={t('company.phone.placeholder')}
            {...register('phone')}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div>
          <input
            placeholder={t('company.nif.placeholder')}
            {...register('nif')}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>
        <div>
          <input
            placeholder={t('company.urlLogo.placeholder')}
            {...register('urlLogo')}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div>
          <input
            placeholder={t('company.cssLogo.placeholder')}
            {...register('cssLogo')}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <fieldset className="border-t pt-4">
          <legend className="text-lg font-semibold mb-2">
            {t('company.address.title')}
          </legend>
          <div>
            <input
              placeholder={t('company.address.street.placeholder')}
              {...register('address.address')}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>
          <div>
            <input
              placeholder={t('company.address.city.placeholder')}
              {...register('address.city')}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>
          <div>
            <input
              placeholder={t('company.address.postalCode.placeholder')}
              {...register('address.postalCode')}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>
          <div>
            <input
              placeholder={t('company.address.province.placeholder')}
              {...register('address.province')}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isSubmitting ? t('common.saving') : t('common.save')}
          {isSubmitting && <SvgSpinner className="w-6 h-6" />}
        </button>
        {success !== undefined && !success && (
          <ErrorMessage message={t('common.errorUpdate')} title="Error" />
        )}
        {success && <SuccessfulMessage message={t('common.update')} title="" />}
      </form>
    </div>
  );
}
