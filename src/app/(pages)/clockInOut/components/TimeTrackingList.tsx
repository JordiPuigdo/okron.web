'use client';

import { useMemo } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import {
  calculateWorkedHours,
  TimeTracking,
} from 'app/interfaces/TimeTracking';
import { Clock, User } from 'lucide-react';

interface TimeTrackingListProps {
  timeTrackings: TimeTracking[];
  isLoading: boolean;
  onRefresh: () => void;
}

interface GroupedTimeTrackings {
  operatorId: string;
  operatorCode: string;
  operatorName: string;
  trackings: TimeTracking[];
  totalHours: number;
}

export const TimeTrackingList = ({
  timeTrackings,
  isLoading,
  onRefresh,
}: TimeTrackingListProps) => {
  const { t } = useTranslations();
  // Agrupar fichajes por operario
  const groupedTrackings = useMemo<GroupedTimeTrackings[]>(() => {
    const groups = new Map<string, GroupedTimeTrackings>();

    timeTrackings.forEach(tracking => {
      const key = tracking.operatorId;
      if (!groups.has(key)) {
        groups.set(key, {
          operatorId: tracking.operatorId,
          operatorCode: '',
          operatorName: tracking.operatorName || '',
          trackings: [],
          totalHours: 0,
        });
      }

      const group = groups.get(key)!;
      group.trackings.push(tracking);
      group.totalHours += calculateWorkedHours(tracking);
    });

    return Array.from(groups.values()).sort(
      (a, b) => b.totalHours - a.totalHours
    );
  }, [timeTrackings]);

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString('ca-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatHours = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <SvgSpinner className="h-8 w-8 text-blue-600" />
        <span className="ml-3 text-gray-600">{t('loadingTimeTrackings')}</span>
      </div>
    );
  }

  if (groupedTrackings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('noTimeTrackingsFound')}
        </h3>
        <p className="text-gray-600">{t('noTimeTrackingsMessage')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupedTrackings.map(group => (
        <div
          key={group.operatorId}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Header del Operario */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 rounded-full p-2">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {group.operatorName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {group.trackings.length} {t('timeTracking')}
                    {group.trackings.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">{t('totalWorked')}</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatHours(group.totalHours)}
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Fichajes */}
          <div className="divide-y divide-gray-200">
            {group.trackings.map(tracking => {
              const workedHours = calculateWorkedHours(tracking);
              const isOpen = !tracking.endDateTime;

              return (
                <div
                  key={tracking.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      {/* Entrada */}
                      <div className="flex items-center gap-2">
                        <div className="bg-green-100 rounded-full p-2">
                          <Clock className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">
                            {t('entry')}
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {formatTime(tracking.startDateTime)}
                          </div>
                        </div>
                      </div>

                      {/* Salida */}
                      <div className="flex items-center gap-2">
                        <div
                          className={`rounded-full p-2 ${
                            isOpen ? 'bg-yellow-100' : 'bg-red-100'
                          }`}
                        >
                          <Clock
                            className={`h-4 w-4 ${
                              isOpen ? 'text-yellow-600' : 'text-red-600'
                            }`}
                          />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">
                            {t('exit')}
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {isOpen ? (
                              <span className="text-yellow-600">
                                {t('onGoing')}
                              </span>
                            ) : (
                              formatTime(tracking.endDateTime!)
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Horas Trabajadas */}
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {t('workedHours')}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {isOpen ? (
                          <span className="text-yellow-600">
                            {t('onGoing')}
                          </span>
                        ) : (
                          formatHours(workedHours)
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Comentarios si existen */}
                  {tracking.comments && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600 italic">
                        {tracking.comments}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
