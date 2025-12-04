'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useTranslations } from 'app/hooks/useTranslations';
import { useVacations } from 'app/hooks/useVacations';
import { CreateVacationRequestDto } from 'app/interfaces/Vacation';
import ca from 'date-fns/locale/ca';
import { Button } from 'designSystem/Button/Buttons';

interface VacationRequestFormProps {
  operatorId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const VacationRequestForm = ({
  operatorId,
  onSuccess,
  onCancel,
}: VacationRequestFormProps) => {
  const { t } = useTranslations();
  const { createVacationRequest, calculateVacationDays } = useVacations();

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatedDays = calculateVacationDays(startDate, endDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const dto: CreateVacationRequestDto = {
        operatorId,
        startDate,
        endDate,
        reason,
      };

      await createVacationRequest(dto);

      // Reset form
      setStartDate(new Date());
      setEndDate(new Date());
      setReason('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || t('vacation.error.create'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('start')}</label>
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => date && setStartDate(date)}
            dateFormat="dd/MM/yyyy"
            locale={ca}
            minDate={new Date()}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('final')}</label>
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => date && setEndDate(date)}
            dateFormat="dd/MM/yyyy"
            locale={ca}
            minDate={startDate}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t('vacation.reason')}
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder={t('vacation.reasonPlaceholder')}
          rows={3}
        />
      </div>

      <div className="bg-blue-50 p-3 rounded-md">
        <span className="text-sm font-medium">
          {t('vacation.calculatedDays')}: {calculatedDays} {t('days')}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button onClick={onCancel} type="cancel" className="secondary">
            {t('common.cancel')}
          </Button>
        )}
        <Button
          type="create"
          isSubmitting
          disabled={isLoading}
          className="primary"
        >
          {t('vacation.request')}
        </Button>
      </div>
    </form>
  );
};
