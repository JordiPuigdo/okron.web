'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useHolidays } from 'app/hooks/useHolidays';
import { useTranslations } from 'app/hooks/useTranslations';
import { useVacations } from 'app/hooks/useVacations';
import {
  CreateVacationRequestDto,
  VacationType,
} from 'app/interfaces/Vacation';
import { Input } from 'components/ui/input';
import ca from 'date-fns/locale/ca';
import { Button } from 'designSystem/Button/Buttons';
import { cn } from 'lib/utils';

interface VacationRequestFormProps {
  operatorId: string;
  workingHoursPerDay?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type HoursMode = 'halfday' | 'custom';

export const VacationRequestForm = ({
  operatorId,
  workingHoursPerDay = 8,
  onSuccess,
  onCancel,
}: VacationRequestFormProps) => {
  const { t } = useTranslations();
  const { createVacationRequest } = useVacations();
  const { holidays } = useHolidays();

  const [vacationType, setVacationType] = useState<VacationType>(
    VacationType.FullDay
  );
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [hoursMode, setHoursMode] = useState<HoursMode | null>(null);
  const [customHours, setCustomHours] = useState<number | null>(null);
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestedHours = hoursMode === 'halfday' ? 4 : customHours;

  const holidayDatesSet = useMemo(() => {
    return new Set(
      holidays.map(h => {
        const date = new Date(h.date);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      })
    );
  }, [holidays]);

  const holidayDatesArray = useMemo(() => {
    return holidays.map(h => new Date(h.date));
  }, [holidays]);

  const getDayClassName = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return holidayDatesSet.has(dateKey) ? 'holiday-day' : '';
  };

  const calculatedDays = useMemo(() => {
    if (vacationType === VacationType.Hours) return 0;
    let count = 0;
    const current = new Date(startDate);
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      const dateKey = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDatesSet.has(dateKey)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }, [startDate, endDate, holidayDatesSet, vacationType]);

  const holidaysInRange = useMemo(() => {
    if (vacationType === VacationType.Hours) return [];
    const result: { date: Date; name: string }[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateKey = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;
      if (holidayDatesSet.has(dateKey)) {
        const holiday = holidays.find(h => {
          const d = new Date(h.date);
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === dateKey;
        });
        if (holiday) result.push({ date: new Date(current), name: holiday.name });
      }
      current.setDate(current.getDate() + 1);
    }
    return result;
  }, [startDate, endDate, holidayDatesSet, holidays, vacationType]);

  const calculatedHoursDays = useMemo(() => {
    if (!requestedHours || requestedHours <= 0) return 0;
    return workingHoursPerDay > 0 ? requestedHours / workingHoursPerDay : 0;
  }, [requestedHours, workingHoursPerDay]);

  const isSelectedDateHoliday = useMemo(() => {
    const dateKey = `${startDate.getFullYear()}-${startDate.getMonth()}-${startDate.getDate()}`;
    return holidayDatesSet.has(dateKey);
  }, [startDate, holidayDatesSet]);

  const validateHoursMode = (): string | null => {
    const dayOfWeek = startDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return t('vacation.error.weekend');
    if (isSelectedDateHoliday) return t('vacation.error.holiday');
    if (!requestedHours || requestedHours <= 0) return t('vacation.error.hours.required');
    if (requestedHours > workingHoursPerDay) return t('vacation.error.hours.exceeded');
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (vacationType === VacationType.Hours) {
      const validationError = validateHoursMode();
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setIsLoading(true);
    try {
      let startTime: string | undefined;
      let endTime: string | undefined;

      if (vacationType === VacationType.Hours && requestedHours) {
        const endMinutes = 9 * 60 + requestedHours * 60;
        const endH = Math.floor(endMinutes / 60);
        const endM = endMinutes % 60;
        startTime = '09:00';
        endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
      }

      const dto: CreateVacationRequestDto = {
        operatorId,
        startDate,
        endDate: vacationType === VacationType.Hours ? startDate : endDate,
        reason,
        vacationType,
        startTime,
        endTime,
      };

      await createVacationRequest(dto);

      setStartDate(new Date());
      setEndDate(new Date());
      setHoursMode(null);
      setCustomHours(null);
      setReason('');

      if (onSuccess) onSuccess();
    } catch (err) {
      const caughtError = err as Error;
      setError(caughtError.message || t('vacation.error.create'));
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

      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setVacationType(VacationType.FullDay)}
          className={cn(
            'flex-1 py-2.5 text-sm font-medium transition-colors',
            vacationType === VacationType.FullDay
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          )}
        >
          {t('vacation.type.fullday')}
        </button>
        <button
          type="button"
          onClick={() => setVacationType(VacationType.Hours)}
          className={cn(
            'flex-1 py-2.5 text-sm font-medium transition-colors border-l border-gray-200',
            vacationType === VacationType.Hours
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          )}
        >
          {t('vacation.type.hours')}
        </button>
      </div>

      {vacationType === VacationType.FullDay && (
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
      )}

      {vacationType === VacationType.Hours && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('date')}</label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => date && setStartDate(date)}
              dateFormat="dd/MM/yyyy"
              locale={ca}
              dayClassName={getDayClassName}
              highlightDates={holidayDatesArray}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              {t('vacation.hours.duration')}
            </label>
            <div className="flex gap-3 items-start">
              <button
                type="button"
                onClick={() => {
                  setHoursMode('halfday');
                  setCustomHours(null);
                }}
                className={cn(
                  'flex-1 py-3 px-4 rounded-lg border-2 text-sm font-semibold transition-colors text-center',
                  hoursMode === 'halfday'
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                )}
              >
                {t('vacation.halfday')}
                <span className="block text-xs font-normal mt-0.5 opacity-75">4h</span>
              </button>

              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1.5">
                  {t('vacation.hours.custom')}
                </label>
                <Input
                  mode="number"
                  value={hoursMode === 'custom' ? customHours : null}
                  onValueChange={v => {
                    setHoursMode('custom');
                    setCustomHours(v);
                  }}
                  min={1}
                  max={workingHoursPerDay}
                  placeholder={`1 – ${workingHoursPerDay}`}
                  className={cn(
                    'w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-auto',
                    hoursMode === 'custom'
                      ? 'border-blue-500'
                      : 'border-gray-300'
                  )}
                />
              </div>
            </div>
          </div>

          {requestedHours && requestedHours > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {t('vacation.calculated.hours')}:
              </span>
              <span className="text-lg font-bold text-blue-700">
                {requestedHours} h = {calculatedHoursDays.toFixed(2)} {t('days')}
              </span>
            </div>
          )}

          {isSelectedDateHoliday && (
            <div className="bg-amber-50 text-amber-700 p-3 rounded-lg text-sm">
              {t('vacation.error.holiday')}
            </div>
          )}
        </div>
      )}

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

      {vacationType === VacationType.FullDay && (
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
      )}

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
        <Button type="create" isSubmit disabled={isLoading} className="primary">
          {isLoading ? t('common.loading') : t('vacation.request')}
        </Button>
      </div>
    </form>
  );
};
