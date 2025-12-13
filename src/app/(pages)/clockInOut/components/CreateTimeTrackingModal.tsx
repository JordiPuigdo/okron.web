'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useOperatorHook } from 'app/hooks/useOperatorsHook';
import { useTimeTracking } from 'app/hooks/useTimeTracking';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import { TimeTracking } from 'app/interfaces/TimeTracking';
import ca from 'date-fns/locale/ca';
import { Button } from 'designSystem/Button/Buttons';
import { X } from 'lucide-react';

interface TimeTrackingModalProps {
  timeTracking?: TimeTracking; // Si está presente, modo edición
  onClose: () => void;
  onSuccess: () => void;
}

export const TimeTrackingModal = ({
  timeTracking,
  onClose,
  onSuccess,
}: TimeTrackingModalProps) => {
  const { createTimeTracking, updateTimeTracking, isLoading } =
    useTimeTracking();
  const { operators } = useOperatorHook();
  const { t } = useTranslations();

  const isEditMode = !!timeTracking;

  const [operatorId, setOperatorId] = useState<string>(
    timeTracking?.operatorId || ''
  );
  const [startDateTime, setStartDateTime] = useState<Date>(
    timeTracking?.startDateTime
      ? new Date(timeTracking.startDateTime)
      : new Date()
  );
  const [endDateTime, setEndDateTime] = useState<Date | null>(
    timeTracking?.endDateTime ? new Date(timeTracking.endDateTime) : null
  );
  const [comments, setComments] = useState<string>(
    timeTracking?.comments || ''
  );

  // Verificar si la fecha seleccionada es hoy
  const isStartDateToday = () => {
    const today = new Date();
    return (
      startDateTime.getDate() === today.getDate() &&
      startDateTime.getMonth() === today.getMonth() &&
      startDateTime.getFullYear() === today.getFullYear()
    );
  };

  const isEndDateToday = () => {
    if (!endDateTime) return false;
    const today = new Date();
    return (
      endDateTime.getDate() === today.getDate() &&
      endDateTime.getMonth() === today.getMonth() &&
      endDateTime.getFullYear() === today.getFullYear()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!operatorId) {
      alert('Selecciona un operario');
      return;
    }

    let result;
    if (isEditMode && timeTracking) {
      result = await updateTimeTracking(timeTracking.id, {
        id: timeTracking.id,
        startDateTime,
        endDateTime: endDateTime || undefined,
        comments: comments || undefined,
      });
    } else {
      result = await createTimeTracking({
        operatorId,
        startDateTime,
        endDateTime: endDateTime || undefined,
        comments: comments || undefined,
      });
    }

    if (result) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? t('editClockInOut') : t('manualClockInOut')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Operario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('operator')} <span className="text-red-500">*</span>
            </label>
            {isEditMode ? (
              <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                {timeTracking?.operatorName}
              </div>
            ) : (
              <select
                value={operatorId}
                onChange={e => setOperatorId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona un operario</option>
                {operators?.map(op => (
                  <option key={op.id} value={op.id}>
                    {op.code} - {op.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Fecha y Hora de Entrada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('entry')} <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={startDateTime}
              onChange={date => setStartDateTime(date || new Date())}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy HH:mm"
              locale={ca}
              maxDate={isEditMode ? undefined : new Date()}
              maxTime={
                isEditMode || !isStartDateToday() ? undefined : new Date()
              }
              minTime={
                isEditMode || !isStartDateToday()
                  ? undefined
                  : new Date(new Date().setHours(0, 0, 0, 0))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              wrapperClassName="w-full"
            />
          </div>

          {/* Fecha y Hora de Salida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('exit')} (Opcional)
            </label>
            <DatePicker
              selected={endDateTime}
              onChange={date => setEndDateTime(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy HH:mm"
              locale={ca}
              maxDate={isEditMode ? undefined : new Date()}
              maxTime={isEditMode || !isEndDateToday() ? undefined : new Date()}
              minDate={startDateTime}
              placeholderText={t('leaveEmptyIfOpen')}
              isClearable
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              wrapperClassName="w-full"
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('ifLeftEmptyOpenClockInOut')}
            </p>
          </div>

          {/* Comentarios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('comments')} (Opcional)
            </label>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              rows={3}
              placeholder={t('commentsPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button onClick={onClose} variant="secondary" disabled={isLoading}>
              {t('cancel')}
            </Button>
            <Button isSubmit disabled={isLoading}>
              {isLoading ? (
                <>
                  <SvgSpinner className="h-4 w-4 mr-2" />
                  {isEditMode ? t('updating') : t('creating')}
                </>
              ) : isEditMode ? (
                t('update')
              ) : (
                t('create')
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Export alias para compatibilidad
export const CreateTimeTrackingModal = TimeTrackingModal;
