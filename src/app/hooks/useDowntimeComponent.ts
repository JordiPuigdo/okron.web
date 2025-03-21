// hooks/useDowntimes.ts
import { useEffect, useState } from 'react';
import { calculateTotalSecondsBetweenDates } from 'app/(pages)/reports/downtimesReport/component/downtimeUtils';
import { Downtimes } from 'app/interfaces/Production/Downtimes';
import WorkOrderService from 'app/services/workOrderService';
import {
  calculateTimeDifference,
  validateFormattedDateTime,
} from 'app/utils/utils';
import dayjs from 'dayjs';

export function useDowntimes(
  initialDowntimes: Downtimes[],
  workOrderId: string
) {
  const workOrderService = new WorkOrderService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  const [downtimesWorkorder, setDowntimesWorkorder] =
    useState<Downtimes[]>(initialDowntimes);

  useEffect(() => {
    setDowntimesWorkorder(initialDowntimes);
  }, [initialDowntimes]);

  const handleUpdate = (id: string, newValue: string, isStart: boolean) => {
    if (!validateFormattedDateTime(newValue)) {
      alert('Format incorrecte, dia/mes/any hores:minuts:segons');
      return;
    }

    const format = 'DD/MM/YYYY HH:mm:ss';
    const dateToSend = dayjs(newValue, format).utc().format(format);
    const newDate = dayjs(newValue, format).utc().format();

    workOrderService.UpdateDowntime({
      startDate: isStart ? dateToSend : '',
      endDate: !isStart ? dateToSend : '',
      workOrderId,
      downtimeId: id,
    });

    setDowntimesWorkorder(prev =>
      prev.map(x =>
        x.id === id
          ? {
              ...x,
              startTime: isStart ? newDate : x.startTime,
              endTime: !isStart ? newDate : x.endTime,
              totalTime: calculateTimeDifference(
                isStart ? newDate : x.startTime,
                !isStart ? newDate : x.endTime
              ),
            }
          : x
      )
    );
  };

  const totalTime = downtimesWorkorder.reduce((acc, cur) => {
    return acc + calculateTotalSecondsBetweenDates(cur.startTime, cur.endTime);
  }, 0);

  function totalTimeString(time: number): string {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(Math.floor(seconds)).padStart(2, '0')}`;
  }

  return { downtimesWorkorder, handleUpdate, totalTime, totalTimeString };
}
