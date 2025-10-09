import 'dayjs/locale/es';

import React from 'react';
import Operator from 'app/interfaces/Operator';
import { WorkOrderOperatorTimes } from 'app/interfaces/workOrder';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

interface OperatorTimesProps {
  timesByOperator: {
    [key: string]: {
      operator: Operator;
      travelTimes: WorkOrderOperatorTimes[];
      workTimes: WorkOrderOperatorTimes[];
    };
  };
}

/** Formatear hora o devolver "-" */
const formatTime = (date: Date | null): string => {
  return date ? dayjs(date).tz('Europe/Madrid').format('HH:mm') : '-';
};

/** Convertir duración en ms → "Xh Ym" */
const formatDuration = (ms: number): string => {
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
};

const getEarliestDate = (
  times: WorkOrderOperatorTimes[],
  field: 'startTime' | 'endTime'
): Date | null => {
  if (!times.length) return null;
  return times.reduce<Date | null>((earliest, current) => {
    if (!current[field]) return earliest;
    const currentDate = new Date(current[field]!);
    return !earliest || currentDate < earliest ? currentDate : earliest;
  }, null);
};

const getLatestDate = (
  times: WorkOrderOperatorTimes[],
  field: 'startTime' | 'endTime'
): Date | null => {
  if (!times.length) return null;
  return times.reduce<Date | null>((latest, current) => {
    if (!current[field]) return latest;
    const currentDate = new Date(current[field]!);
    return !latest || currentDate > latest ? currentDate : latest;
  }, null);
};

export const OperatorTimesDisplay: React.FC<OperatorTimesProps> = ({
  timesByOperator,
}) => {
  const operators = Object.values(timesByOperator);

  if (!operators.length) {
    return <span className="text-gray-500">No especificat</span>;
  }

  return (
    <div className="overflow-x-auto ">
      {/* Encabezados */}
      <div className="grid grid-cols-6 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
        <div className="bg-white">HORES TÈCNICS</div>
        <div className="px-4 py-2">Inici desplaçament</div>
        <div className="px-4 py-2">Inici treball</div>
        <div className="px-4 py-2">Fi treball</div>
        <div className="px-4 py-2">Fi desplaçament</div>
        <div className="px-4 py-2">Total</div>
      </div>

      {/* Filas */}
      {operators.map(({ operator, travelTimes, workTimes }) => {
        const earliestTravelStart = getEarliestDate(travelTimes, 'startTime');
        const latestTravelEnd = getLatestDate(travelTimes, 'endTime');
        const workStart = getEarliestDate(workTimes, 'startTime');
        const workEnd = getLatestDate(workTimes, 'endTime');

        const totalTimeMs = [...travelTimes, ...workTimes].reduce(
          (total, time) => {
            if (time.startTime && time.endTime) {
              const start = new Date(time.startTime).getTime();
              const end = new Date(time.endTime).getTime();
              return total + (end - start);
            }
            return total;
          },
          0
        );

        return (
          <div
            key={operator.id}
            className="grid grid-cols-6 border-b border-gray-200 text-sm"
          >
            <div className="px-4 py-2 text-gray-900 font-medium">
              {operator.name}
            </div>
            <div className="px-4 py-2 text-gray-600">
              {formatTime(earliestTravelStart)}
            </div>
            <div className="px-4 py-2 text-gray-600">
              {formatTime(workStart)}
            </div>
            <div className="px-4 py-2 text-gray-600">{formatTime(workEnd)}</div>
            <div className="px-4 py-2 text-gray-600">
              {formatTime(latestTravelEnd)}
            </div>
            <div className="px-4 py-2 text-gray-900 font-semibold">
              {formatDuration(totalTimeMs)}
            </div>
          </div>
        );
      })}
    </div>
  );
};
