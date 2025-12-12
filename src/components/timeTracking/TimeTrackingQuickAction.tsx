'use client';

import { useEffect, useState } from 'react';
import { useTimeTracking } from 'app/hooks/useTimeTracking';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import { useSessionStore } from 'app/stores/globalStore';
import { Clock, LogIn, LogOut } from 'lucide-react';

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

  // Actualizar tiempo trabajado cada minuto
  useEffect(() => {
    if (!currentTimeTracking) return;

    const updateTime = () => {
      const start = new Date(currentTimeTracking.startDateTime);
      const now = new Date();
      const diff = now.getTime() - start.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setWorkedTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
          2,
          '0'
        )}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [currentTimeTracking]);

  const handleClockIn = async () => {
    if (!operatorLogged?.idOperatorLogged) return;

    const result = await clockIn({
      operatorId: operatorLogged.idOperatorLogged,
      startDateTime: new Date(),
    });

    if (result) {
      // Mostrar feedback exitoso
      console.log('Fichaje de entrada registrado');
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
    }
  };

  if (!operatorLogged?.idOperatorLogged) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
      <Clock className="h-5 w-5 text-gray-600" />

      {currentTimeTracking ? (
        <>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Fichado desde</span>
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
            Salida
          </button>
        </>
      ) : (
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
          Entrada
        </button>
      )}
    </div>
  );
};
