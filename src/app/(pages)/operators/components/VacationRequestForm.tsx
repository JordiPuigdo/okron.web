'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useHolidays } from 'app/hooks/useHolidays';
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
  const { createVacationRequest } = useVacations();
  const { holidays } = useHolidays();

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Crear Set de fechas festivas para búsqueda rápida
  const holidayDatesSet = useMemo(() => {
    return new Set(
      holidays.map(h => {
        const date = new Date(h.date);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      })
    );
  }, [holidays]);

  // Crear array de fechas festivas para el DatePicker
  const holidayDatesArray = useMemo(() => {
    return holidays.map(h => new Date(h.date));
  }, [holidays]);

  // Calcula los días de vacaciones excluyendo fines de semana y festivos
  const calculatedDays = useMemo(() => {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      const dateKey = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;

      // Excluir fines de semana (0 = domingo, 6 = sábado) y festivos
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDatesSet.has(dateKey)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }, [startDate, endDate, holidayDatesSet]);

  // Contar festivos en el rango seleccionado
  const holidaysInRange = useMemo(() => {
    const result: { date: Date; name: string }[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dateKey = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;
      if (holidayDatesSet.has(dateKey)) {
        const holiday = holidays.find(h => {
          const d = new Date(h.date);
          return (
            `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === dateKey
          );
        });
        if (holiday) {
          result.push({ date: new Date(current), name: holiday.name });
        }
      }
      current.setDate(current.getDate() + 1);
    }

    return result;
  }, [startDate, endDate, holidayDatesSet, holidays]);

  // Función para aplicar clase CSS a días festivos
  const getDayClassName = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (holidayDatesSet.has(dateKey)) {
      return 'holiday-day';
    }
    return '';
  };

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
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <style>{`
        .holiday-day {
          background-color: #fef3c7 !important;
          color: #92400e !important;
          font-weight: 600;
        }
        .holiday-day:hover {
          background-color: #fde68a !important;
        }
        .react-datepicker__day--selected.holiday-day {
          background-color: #f59e0b !important;
          color: white !important;
        }
      `}</style>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">{t('start')}</label>
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => date && setStartDate(date)}
            dateFormat="dd/MM/yyyy"
            locale={ca}
            dayClassName={getDayClassName}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{t('final')}</label>
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => date && setEndDate(date)}
            dateFormat="dd/MM/yyyy"
            locale={ca}
            minDate={startDate}
            dayClassName={getDayClassName}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {t('vacation.reason')}
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={t('vacation.reasonPlaceholder')}
          rows={3}
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {t('vacation.calculatedDays')}:
          </span>
          <span className="text-lg font-bold text-blue-700">
            {calculatedDays} {t('days')}
          </span>
        </div>

        {holidaysInRange.length > 0 && (
          <div className="border-t border-blue-200 pt-3 mt-3">
            <p className="text-sm font-medium text-amber-700 mb-2">
              {t('vacation.holidaysExcluded')} ({holidaysInRange.length}):
            </p>
            <ul className="space-y-1">
              {holidaysInRange.map((h, idx) => (
                <li
                  key={idx}
                  className="text-sm text-amber-600 flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                  <span className="font-medium">
                    {h.date.toLocaleDateString('ca-ES', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </span>
                  <span>- {h.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end pt-2">
        {onCancel && (
          <Button onClick={onCancel} type="cancel" className="secondary">
            {t('common.cancel')}
          </Button>
        )}
        <Button
          type="create"
          isSubmit
          disabled={isLoading}
          className="primary"
        >
          {isLoading ? t('common.loading') : t('vacation.request')}
        </Button>
      </div>
    </form>
  );
};
