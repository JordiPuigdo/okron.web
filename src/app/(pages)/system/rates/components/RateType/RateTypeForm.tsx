'use client';

import { useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';

type RateTypeFormData = {
  code: string;
  description: string;
};

export function RateTypeForm({
  onSubmit,
  loading,
  initialData,
}: {
  onSubmit: (data: RateTypeFormData) => Promise<void>;
  loading: boolean;
  initialData?: RateTypeFormData;
}) {
  const { t } = useTranslations();
  const [form, setForm] = useState<RateTypeFormData>(
    initialData || { code: '', description: '' }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return;
    await onSubmit({
      code: form.code.trim(),
      description: form.description.trim(),
    });
    setForm({ code: '', description: '' });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
      noValidate
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('code')} *
        </label>
        <input
          type="text"
          name="code"
          value={form.code}
          onChange={handleChange}
          placeholder={t('system.rateTypes.codePlaceholder')}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('description')}
        </label>
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder={t('system.rateTypes.descriptionPlaceholder')}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        />
      </div>

      <div className="flex gap-8">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t('common.saving') : t('create')}
        </button>
      </div>
    </form>
  );
}
