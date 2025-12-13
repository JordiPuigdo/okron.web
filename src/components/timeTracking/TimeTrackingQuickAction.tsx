'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useCallback, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useTimeTracking } from 'app/hooks/useTimeTracking';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import { timeTrackingService } from 'app/services/timeTrackingService';
import { useSessionStore } from 'app/stores/globalStore';
import ca from 'date-fns/locale/ca';
import { Clock, Edit3, LogIn, LogOut } from 'lucide-react';

/**
 * Componente rápido de fichaje para el header
 * Permite fichar entrada/salida rápidamente
 */
export const TimeTrackingQuickAction = () => {
  const { operatorLogged } = useSessionStore(state => state);
  const { t } = useTranslations();
  const {
    currentTimeTracking,
    isLoading,
    clockIn,
    clockOut,
    checkOpenTimeTracking,
  } = useTimeTracking(operatorLogged?.idOperatorLogged);

  const [workedTime, setWorkedTime] = useState<string>('00:00:00');
  const [dailyTotal, setDailyTotal] = useState<string>('00:00:00');
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualDateTime, setManualDateTime] = useState<Date>(new Date());
  const [isClockIn, setIsClockIn] = useState(true);

  /**
   * Calcula el tiempo transcurrido desde el inicio del fichaje
   * Single Responsibility: Solo calcula el tiempo
   */
  const calculateElapsedTime = useCallback((startDateTime: Date): string => {
    const start = new Date(startDateTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();

    if (diff < 0) return '00:00:00';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(seconds).padStart(2, '0')}`;
  }, []);

  /**
   * Convierte horas decimales a formato HH:MM:SS
   * Single Responsibility: Solo formatea
   */
  const formatHoursToTime = useCallback((totalHours: number): string => {
    const hours = Math.floor(totalHours);
    const minutes = Math.floor((totalHours - hours) * 60);
    const seconds = Math.floor(((totalHours - hours) * 60 - minutes) * 60);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(seconds).padStart(2, '0')}`;
  }, []);

  /**
   * Obtiene el resumen diario del operario
   * Dependency Inversion: Usa el servicio directamente, no depende del hook
   */
  const fetchDailySummary = useCallback(async () => {
    if (!operatorLogged?.idOperatorLogged) return;

    try {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const summary = await timeTrackingService.getDailySummary(
        operatorLogged.idOperatorLogged,
        startOfDay,
        endOfDay
      );

      if (summary.length > 0) {
        setDailyTotal(formatHoursToTime(summary[0].totalHours));
      } else {
        setDailyTotal('00:00:00');
      }
    } catch (error) {
      console.error('Error fetching daily summary:', error);
      setDailyTotal('00:00:00');
    }
  }, [operatorLogged?.idOperatorLogged, formatHoursToTime]);

  // Actualizar tiempo trabajado cada segundo
  useEffect(() => {
    if (!currentTimeTracking) {
      setWorkedTime('00:00:00');
      return;
    }

    const updateTime = () => {
      setWorkedTime(calculateElapsedTime(currentTimeTracking.startDateTime));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [currentTimeTracking, calculateElapsedTime]);

  // Actualizar resumen diario cada minuto
  useEffect(() => {
    fetchDailySummary();
    const interval = setInterval(fetchDailySummary, 60000);

    return () => clearInterval(interval);
  }, [fetchDailySummary]);

  const handleClockIn = async () => {
    if (!operatorLogged?.idOperatorLogged) return;

    const result = await clockIn({
      operatorId: operatorLogged.idOperatorLogged,
      startDateTime: new Date(),
    });

    if (result) {
      // Mostrar feedback exitoso
      console.log('Fichaje de entrada registrado');
      // Actualizar resumen del día
      await fetchDailySummary();
    }
  };

  const handleClockOut = async () => {
    if (!operatorLogged?.idOperatorLogged) return;

    const result = await clockOut({
      operatorId: operatorLogged.idOperatorLogged,
      endDateTime: new Date(),
    });

    if (result) {
      // Mostrar feedback exitoso
      console.log('Fichaje de salida registrado');
      // Refrescar estado
      checkOpenTimeTracking(operatorLogged.idOperatorLogged);
      // Actualizar resumen del día inmediatamente
      await fetchDailySummary();
    }
  };

  const openManualModal = (clockInMode: boolean) => {
    setIsClockIn(clockInMode);
    setManualDateTime(new Date());
    setShowManualModal(true);
  };

  const handleManualClockSubmit = async () => {
    if (!operatorLogged?.idOperatorLogged) return;

    if (isClockIn) {
      const result = await clockIn({
        operatorId: operatorLogged.idOperatorLogged,
        startDateTime: manualDateTime,
      });

      if (result) {
        console.log('Fichaje de entrada manual registrado');
        setShowManualModal(false);
        await fetchDailySummary();
      }
    } else {
      const result = await clockOut({
        operatorId: operatorLogged.idOperatorLogged,
        endDateTime: manualDateTime,
      });

      if (result) {
        console.log('Fichaje de salida manual registrado');
        setShowManualModal(false);
        checkOpenTimeTracking(operatorLogged.idOperatorLogged);
        await fetchDailySummary();
      }
    }
  };

  if (!operatorLogged?.idOperatorLogged) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
        <Clock className="h-5 w-5 text-gray-600" />

        {/* Total del día */}
        <div className="flex flex-col border-r border-gray-300 pr-3">
          <span className="text-xs text-gray-500">{t('totalToday')}</span>
          <span className="text-sm font-semibold text-blue-600">
            {dailyTotal}
          </span>
        </div>

        {currentTimeTracking ? (
          <>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">{t('clockedFrom')}</span>
              <span className="text-sm font-semibold text-green-600">
                {workedTime}
              </span>
            </div>
            <button
              onClick={handleClockOut}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <SvgSpinner className="h-4 w-4" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              {t('exit')}
            </button>
            <button
              onClick={() => openManualModal(false)}
              disabled={isLoading}
              className="flex items-center gap-1 px-2 py-1.5 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
              title="Fichar salida manual"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleClockIn}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <SvgSpinner className="h-4 w-4" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {t('entry')}
            </button>
            <button
              onClick={() => openManualModal(true)}
              disabled={isLoading}
              className="flex items-center gap-1 px-2 py-1.5 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
              title="Fichar entrada manual"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Modal para fichaje manual */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {t('manualClockInOut')} - {isClockIn ? t('entry') : t('exit')}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dateAndTime')}
              </label>
              <div className="relative">
                <DatePicker
                  selected={manualDateTime}
                  onChange={date => setManualDateTime(date || new Date())}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy HH:mm"
                  locale={ca}
                  maxDate={new Date()}
                  maxTime={new Date()}
                  minTime={new Date(new Date().setHours(0, 0, 0, 0))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  wrapperClassName="w-full"
                  calendarClassName="!z-[60]"
                  popperClassName="!z-[60]"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowManualModal(false)}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleManualClockSubmit}
                disabled={isLoading}
                className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 ${
                  isClockIn
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {isLoading ? (
                  <SvgSpinner className="h-4 w-4" />
                ) : (
                  `${t('confirm')} ${isClockIn ? t('entry') : t('exit')}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
