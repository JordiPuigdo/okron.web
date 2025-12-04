'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useTranslations } from 'app/hooks/useTranslations';
import { Holiday, HolidayCreateRequest } from 'app/interfaces/Holiday';
import ca from 'date-fns/locale/ca';
import { Button } from 'designSystem/Button/Buttons';

interface HolidayFormProps {
  holiday?: Holiday;
  onSubmit: (data: HolidayCreateRequest) => Promise<void>;
  onCancel: () => void;
}

export const HolidayForm = ({
  holiday,
  onSubmit,
  onCancel,
}: HolidayFormProps) => {
  const { t } = useTranslations();
  const [formData, setFormData] = useState<HolidayCreateRequest>({
    date: holiday?.date ? new Date(holiday.date) : new Date(),
    name: holiday?.name || '',
    description: holiday?.description || '',
    year: holiday?.year || new Date().getFullYear(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('holidays.form.errors.nameRequired');
    }

    if (!formData.date) {
      newErrors.date = t('holidays.form.errors.dateRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting holiday:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData({
        ...formData,
        date,
        year: date.getFullYear(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          {t('holidays.form.name')}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder={t('holidays.form.namePlaceholder')}
        />
        {errors.name && (
          <span className="text-red-500 text-sm">{errors.name}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t('holidays.form.date')}
        </label>
        <DatePicker
          selected={formData.date}
          onChange={handleDateChange}
          dateFormat="dd/MM/yyyy"
          locale={ca}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        {errors.date && (
          <span className="text-red-500 text-sm">{errors.date}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t('holidays.form.description')}
        </label>
        <textarea
          value={formData.description}
          onChange={e =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder={t('holidays.form.descriptionPlaceholder')}
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button onClick={onCancel} className="secondary" type="cancel">
          {t('common.cancel')}
        </Button>
        <Button disabled={isLoading} className="primary" type="create" isSubmit>
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
};
