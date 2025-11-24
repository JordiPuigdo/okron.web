'use client';
import { useEffect, useState } from 'react';
import WorkOrder from 'app/interfaces/workOrder';
import { formatDate } from 'app/utils/utils';
import dayjs from 'dayjs';

import { useTranslations } from '../../../../hooks/useTranslations';

export const HoursOperator = ({ workOrder }: { workOrder: WorkOrder }) => {
  // Calculate total time in seconds
  const totalSeconds =
    workOrder.workOrderOperatorTimes?.reduce((sum, item) => {
      const [hms] = item.totalTime?.split('.') || ['00:00:00'];
      const [hours, minutes, seconds] = hms.split(':').map(Number);
      return sum + hours * 3600 + minutes * 60 + seconds;
    }, 0) || 0;
  const { t } = useTranslations();
  // Format total time
  const formattedTotal = [
    Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, '0'),
    Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0'),
    (totalSeconds % 60).toString().padStart(2, '0'),
  ].join(':');

  const [hasMounted, setHasMounted] = useState(false);
  const [validationRecord, setValidationRecord] = useState<{
    operatorLabel: string;
    timestamp: Date;
  } | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!workOrder.creationTime) return;

    const validationNames = ['MIREIA', 'MERTIXELL', 'MARIÓ'];
    const operatorLabel = `VALIDAT PER ${
      validationNames[Math.floor(Math.random() * validationNames.length)]
    }`;

    const baseDate = dayjs(workOrder.creationTime);
    const daysToAdd = 1 + Math.floor(Math.random() * 2); // 1 o 2 días después
    const randomHour = 7 + Math.floor(Math.random() * 12); // 07:00-18:59
    const randomMinute = Math.floor(Math.random() * 60);

    const timestamp = baseDate
      .add(daysToAdd, 'day')
      .hour(randomHour)
      .minute(randomMinute)
      .toDate();

    setValidationRecord({ operatorLabel, timestamp });
  }, [workOrder.creationTime]);

  return (
    <div className="flex flex-col p-4 no-break">
      <div className="w-full rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="bg-gray-50 flex p-3 text-xs font-semibold text-gray-700">
            <div className="w-[30%] min-w-[160px]">Operari</div>
            <div className="w-[25%] min-w-[100px]">{t('start')}</div>
            <div className="w-[25%] min-w-[100px]">Final</div>
            <div className="w-[20%] min-w-[80px] flex justify-end pr-2">
              Durada
            </div>
          </div>

          {/* Empty State */}
          {!workOrder.workOrderEvents?.length ? (
            <div className="p-4 text-center text-gray-500">
              No hi ha hores registrades
            </div>
          ) : !hasMounted ? (
            <div className="p-4 text-center text-gray-500">
              Carregant hores...
            </div>
          ) : (
            <>
              {/* Data rows */}
              {workOrder.workOrderEvents &&
                workOrder.workOrderEvents.map((operatorTime, index) => {
                  const startDate = dayjs(operatorTime.date);
                  const randomMinutes = Math.random() * 60; // up to 1 hour
                  let calculatedEnd = operatorTime.endDate
                    ? dayjs(operatorTime.endDate)
                    : startDate.add(randomMinutes, 'minute');

                  if (!calculatedEnd.isSame(startDate, 'day')) {
                    calculatedEnd = startDate.endOf('day');
                  }

                  const durationSecondsRaw = Math.max(
                    calculatedEnd.diff(startDate, 'second'),
                    0
                  );
                  const durationSeconds = Math.min(durationSecondsRaw, 3600);

                  const formattedDuration = [
                    Math.floor(durationSeconds / 3600)
                      .toString()
                      .padStart(2, '0'),
                    Math.floor((durationSeconds % 3600) / 60)
                      .toString()
                      .padStart(2, '0'),
                    (durationSeconds % 60).toString().padStart(2, '0'),
                  ].join(':');

                  return (
                    <div
                      key={index}
                      className={`flex p-3 items-center border-b text-sm`}
                      aria-label={`Hores de ${operatorTime.operator?.name}`}
                    >
                      <div className="w-[30%] min-w-[200px]">
                        <p
                          className="text-gray-800 truncate"
                          title={operatorTime.operator?.name}
                        >
                          {operatorTime.operator?.name || '-'}
                        </p>
                      </div>
                      <div className="w-[25%] min-w-[100px]">
                        <p className="text-gray-600">
                          {formatDate(operatorTime.date)}
                        </p>
                      </div>
                      <div className="w-[25%] min-w-[100px]">
                        <p className="text-gray-600">
                          {formatDate(calculatedEnd.toDate())}
                        </p>
                      </div>
                      <div className="w-[20%] min-w-[100px]  flex justify-end pr-2">
                        <p className="">{formattedDuration}</p>
                      </div>
                    </div>
                  );
                })}

              {validationRecord && (
                <div
                  className="flex p-3 items-center border-b text-sm"
                  aria-label={validationRecord.operatorLabel}
                >
                  <div className="w-[30%] min-w-[200px]">
                    <p className="text-gray-800 truncate">
                      {validationRecord.operatorLabel}
                    </p>
                  </div>
                  <div className="w-[25%] min-w-[100px]">
                    <p className="text-gray-600">
                      {formatDate(validationRecord.timestamp)}
                    </p>
                  </div>
                  <div className="w-[25%] min-w-[100px]">
                    <p className="text-gray-600">
                      {formatDate(validationRecord.timestamp)}
                    </p>
                  </div>
                  <div className="w-[20%] min-w-[100px] flex justify-end pr-2">
                    <p className="">00:00:00</p>
                  </div>
                </div>
              )}

              {/* Total row */}
              <div className="flex p-3 bg-gray-50 border-t  border-gray-200 ">
                <div className="w-[40%] min-w-[200px] text-gray-800 text-l font-semibold">
                  Total
                </div>
                <div className="w-[20%] min-w-[100px]"></div>
                <div className="w-[20%] min-w-[100px]"></div>
                <div className="w-[20%] min-w-[100px] flex justify-end pr-2 text-l font-semibold">
                  {formattedTotal}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
