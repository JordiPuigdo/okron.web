'use client';

import { useEffect, useState } from 'react';
import { useTimeTracking } from 'app/hooks/useTimeTracking';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import { useSessionStore } from 'app/stores/globalStore';
import { Clock, LogIn, LogOut, Edit3 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ca from 'date-fns/locale/ca';

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
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualDateTime, setManualDateTime] = useState<Date>(new Date());
  const [isClockIn, setIsClockIn] = useState(true);

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
              Entrada
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
              Fichaje Manual - {isClockIn ? 'Entrada' : 'Salida'}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha y Hora
              </label>
              <DatePicker
                selected={manualDateTime}
                onChange={(date) => setManualDateTime(date || new Date())}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                locale={ca}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowManualModal(false)}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                Cancelar
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
                  `Confirmar ${isClockIn ? 'Entrada' : 'Salida'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
