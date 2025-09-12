import React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { usePermissions } from 'app/hooks/usePermissions';
import { useTranslations } from 'app/hooks/useTranslations';
import Operator, { OperatorType } from 'app/interfaces/Operator';
import { translateOperatorType } from 'app/utils/utils';

type OperatorFormProps = {
  operator?: Operator;
  onSubmit: SubmitHandler<Operator>;
  onCancel: () => void;
  onDelete?: () => void;
  onUpdatedSuccesfully?: boolean | null;
};

const OperatorForm: React.FC<OperatorFormProps> = ({
  operator,
  onSubmit,
  onCancel,
  onDelete,
  onUpdatedSuccesfully,
}) => {
  const { filterOperatorTypes } = usePermissions();
  const { t } = useTranslations();

  const operatorTypes = filterOperatorTypes(
    Object.values(OperatorType).filter(v => typeof v === 'number')
  );

  const { handleSubmit, control, reset } = useForm<Operator>({
    defaultValues: {
      ...operator,
      operatorType: operator?.operatorType ?? operatorTypes[0],
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg p-6 shadow-md"
    >
      <div className="mb-4">
        <label
          htmlFor="code"
          className="block text-sm font-medium text-gray-700"
        >
          {t('code')}
        </label>
        <Controller
          name="code"
          control={control}
          defaultValue={operator ? operator.code : ''}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder={t('operator.code')}
              className="border rounded-md w-full px-3 py-2 mt-1 text-gray-700 focus:outline-none focus:border-indigo-500"
            />
          )}
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          {t('name')}
        </label>
        <Controller
          name="name"
          control={control}
          defaultValue={operator ? operator.name : ''}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder={t('name')}
              className="border rounded-md w-full px-3 py-2 mt-1 text-gray-700 focus:outline-none focus:border-indigo-500"
            />
          )}
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          {t('price.hour')}
        </label>
        <Controller
          name="priceHour"
          control={control}
          defaultValue={operator ? operator.priceHour : 0}
          render={({ field }) => (
            <input
              {...field}
              type="number"
              placeholder={t('price.hour')}
              className="border rounded-md w-full px-3 py-2 mt-1 text-gray-700 focus:outline-none focus:border-indigo-500"
            />
          )}
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          {t('type')}
        </label>
        <Controller
          name="operatorType"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="border rounded-md w-full px-3 py-2 mt-1 text-gray-700 focus:outline-none focus:border-indigo-500"
              onChange={e => {
                const selectedValue = parseInt(e.target.value, 10);
                field.onChange(selectedValue);
              }}
            >
              {filterOperatorTypes(
                Object.values(OperatorType).filter(v => typeof v === 'number')
              ).map(operatorType => (
                <option key={operatorType} value={operatorType}>
                  {translateOperatorType(operatorType, t)}
                </option>
              ))}
            </select>
          )}
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          {t('active')}
        </label>
        <Controller
          name="active"
          control={control}
          defaultValue={operator ? operator.active : true}
          render={({ field }) => (
            <input
              type="checkbox"
              className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              checked={field.value as boolean}
              onChange={e => field.onChange(e.target.checked)}
            />
          )}
        />
      </div>
      <div className="flex items-center space-x-4">
        <button
          type="submit"
          className="bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
        >
          {t('save')}
        </button>
        <button
          type="button"
          onClick={() => {
            onCancel();
          }}
          className="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-100"
        >
          {t('cancel')}
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-red-600 hover:text-red-900 font-semibold focus:outline-none"
          >
            {t('delete')}
          </button>
        )}

        {onUpdatedSuccesfully !== null && (
          <div
            className={`mb-4 ${
              onUpdatedSuccesfully ? 'text-green-600' : 'text-red-600'
            } text-center`}
          >
            {onUpdatedSuccesfully
              ? t('operator.updated.successfully')
              : t('error.updating.operator')}
          </div>
        )}
      </div>
    </form>
  );
};

export default OperatorForm;
