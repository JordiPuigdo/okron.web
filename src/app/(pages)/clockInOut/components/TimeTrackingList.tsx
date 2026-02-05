'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import {
  calculateWorkedHours,
  TimeTracking,
} from 'app/interfaces/TimeTracking';
import dayjs from 'dayjs';
import { Clock, Edit2, Trash2, User } from 'lucide-react';

interface TimeTrackingListProps {
  timeTrackings: TimeTracking[];
  isLoading: boolean;
  onEdit: (timeTracking: TimeTracking) => void;
  onDelete: (timeTracking: TimeTracking) => void;
  showInactive: boolean;
  onToggleShowInactive: (show: boolean) => void;
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
  onEdit,
  onDelete,
  showInactive,
  onToggleShowInactive,
}: TimeTrackingListProps) => {
  const { t } = useTranslations();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Filtrar fichajes según el estado de showInactive
  const filteredTrackings = useMemo(() => {
    if (showInactive) {
      return timeTrackings;
    }
    return timeTrackings.filter(tt => tt.active !== false);
  }, [timeTrackings, showInactive]);
  // Agrupar fichajes por operario
  const groupedTrackings = useMemo<GroupedTimeTrackings[]>(() => {
    const groups = new Map<string, GroupedTimeTrackings>();

    filteredTrackings.forEach(tracking => {
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
      // Solo sumar horas de fichajes activos al total
      if (tracking.active !== false) {
        group.totalHours += calculateWorkedHours(tracking);
      }
    });

    return Array.from(groups.values()).sort(
      (a, b) => b.totalHours - a.totalHours
    );
  }, [filteredTrackings]);

  const handleDeleteClick = (tracking: TimeTracking) => {
    setConfirmDelete(tracking.id);
  };

  const handleConfirmDelete = (tracking: TimeTracking) => {
    onDelete(tracking);
    setConfirmDelete(null);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
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
      {/* Toggle para mostrar fichajes inactivas */}
      <div className="flex items-center justify-end gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={e => onToggleShowInactive(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">
            {t('showDeletedTimeTrackings')}
          </span>
        </label>
      </div>

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

              const isInactive = tracking.active === false;

              return (
                <div
                  key={tracking.id}
                  className={`px-6 py-4 transition-colors ${
                    isInactive
                      ? 'bg-red-50 opacity-60'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {isInactive && (
                    <div className="mb-2">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                        {t('deleted')}
                      </span>
                    </div>
                  )}
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
                            {dayjs(tracking.startDateTime)
                              .local()
                              .format('DD-MM-YYYY HH:mm')}
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
                              dayjs(tracking.endDateTime!)
                                .local()
                                .format('DD-MM-YYYY HH:mm')
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
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

                      {/* Botón Editar */}
                      {!isInactive && (
                        <button
                          onClick={() => onEdit(tracking)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('edit')}
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                      )}

                      {/* Botón Eliminar */}
                      {!isInactive && (
                        confirmDelete === tracking.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleConfirmDelete(tracking)}
                              className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                            >
                              {t('confirm')}
                            </button>
                            <button
                              onClick={handleCancelDelete}
                              className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                            >
                              {t('cancel')}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDeleteClick(tracking)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={t('delete')}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )
                      )}
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
