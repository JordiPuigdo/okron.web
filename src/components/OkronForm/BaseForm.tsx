'use client';

import { FieldValues, useForm } from 'react-hook-form';
import { SvgSpinner } from 'app/icons/icons';
import { Button } from 'designSystem/Button/Buttons';

interface FieldConfig {
  name: string;
  label: string;
  placeholder: string;
  type?: 'checkbox' | 'text';
  rules?: any;
  isSubmitted?: boolean;
}

interface BaseFormProps<T extends FieldValues> {
  title: string;
  fields: FieldConfig[];
  onSubmit: (data: T) => Promise<void>;
  defaultValues?: Partial<T>;
  isSubmitting?: boolean;
  onCancel?: () => void;
  isSubmitted?: boolean;
  errorMessage?: string;
}

export default function BaseForm<T extends FieldValues>({
  title,
  fields,
  onSubmit,
  defaultValues = {},
  isSubmitting = false,
  onCancel,
  isSubmitted = false,
  errorMessage = undefined,
}: BaseFormProps<T>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<T>({
    defaultValues: defaultValues as import('react-hook-form').DefaultValues<T>,
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 p-4 bg-white shadow-md rounded-md"
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      {fields.map(field => (
        <div key={field.name}>
          <label className="block font-medium">{field.label}</label>
          {field.type === 'checkbox' ? (
            <input
              type="checkbox"
              {...register(field.name as any)}
              className="mr-2"
            />
          ) : (
            <input
              type={field.type || 'text'}
              {...register(field.name as any, field.rules)}
              placeholder={field.placeholder}
              className="w-full border rounded p-2"
            />
          )}
          {errors[field.name as keyof T] && (
            <p className="text-red-500 text-sm">
              {(errors[field.name as keyof T] as any)?.message}
            </p>
          )}
        </div>
      ))}

      <div className="flex flex-row gap-4">
        <Button
          type="create"
          onClick={handleSubmit(onSubmit)}
          customStyles="gap-2 flex"
          disabled={isSubmitting}
        >
          Guardar {isSubmitting && <SvgSpinner />}
        </Button>
        {onCancel && (
          <Button
            type="cancel"
            onClick={onCancel}
            customStyles="gap-2 flex"
            disabled={isSubmitting}
          >
            Cancelar {isSubmitting && <SvgSpinner />}
          </Button>
        )}
      </div>
      {isSubmitted && (
        <div className="bg-green-200 text-green-800 p-4 rounded mb-4">
          Registre guardat
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-200 text-red-800 p-4 rounded mb-4">
          {errorMessage}
        </div>
      )}
    </form>
  );
}
