'use client';
import WorkOrder from 'app/interfaces/workOrder';
import { formatDate, formatTimeSpan } from 'app/utils/utils';

import { useTranslations } from '../../../../hooks/useTranslations';

export const HoursOperator = ({ workOrder }: { workOrder: WorkOrder }) => {
  // Calculate total time in seconds
  const totalSeconds =
    workOrder.workOrderOperatorTimes?.reduce((sum, item) => {
      const [hms] = item.totalTime?.split('.') || ['00:00:00'];
      const [hours, minutes, seconds] = hms.split(':').map(Number);
      return sum + hours * 3600 + minutes * 60 + seconds;
    }, 0) || 0;
  const {t} = useTranslations();
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
          {!workOrder.workOrderOperatorTimes?.length ? (
            <div className="p-4 text-center text-gray-500">
              No hi ha hores registrades
            </div>
          ) : (
            <>
              {/* Data rows */}
              {workOrder.workOrderOperatorTimes.map((operatorTime, index) => (
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
                      {formatDate(operatorTime.startTime)}
                    </p>
                  </div>
                  <div className="w-[25%] min-w-[100px]">
                    <p className="text-gray-600">
                      {operatorTime.endTime && formatDate(operatorTime.endTime)}
                    </p>
                  </div>
                  <div className="w-[20%] min-w-[100px]  flex justify-end pr-2">
                    <p className="">
                      {operatorTime.totalTime &&
                        formatTimeSpan(operatorTime.totalTime!)}
                    </p>
                  </div>
                </div>
              ))}

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
