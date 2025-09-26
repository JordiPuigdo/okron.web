'use client';

import { useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { PaymentMethod } from 'app/interfaces/Customer';

type PaymentMethodFormProps = {
  initialData?: PaymentMethod;
  onSubmit: (data: PaymentMethod) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
};

export function PaymentMethodForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
}: PaymentMethodFormProps) {
  const { t } = useTranslations();
  const [form, setForm] = useState<PaymentMethod>(
    initialData ?? {
      id: '',
      description: '',
      creationDate: new Date(),
      active: true,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedForm = {
      ...form,

      description: form.description.trim(),
    };

    await onSubmit(trimmedForm);

    setForm(prev => ({ ...prev, description: '' }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
      noValidate
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('description')}
        </label>
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder={t('system.paymentMethods.placeholder')}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        />
      </div>

      <div className="flex gap-4 justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t('common.saving') : form.id ? t('common.update') : t('create')}
        </button>
      </div>
    </form>
  );
}
