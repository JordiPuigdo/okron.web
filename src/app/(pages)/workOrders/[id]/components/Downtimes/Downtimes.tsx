import { useDowntimes } from 'app/hooks/useDowntimeComponent';
import { useTranslations } from 'app/hooks/useTranslations';
import { Downtimes } from 'app/interfaces/Production/Downtimes';
import { LoginUser } from 'app/interfaces/User';
import WorkOrder, { StateWorkOrder } from 'app/interfaces/workOrder';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';

import { DowntimeRow } from './DowntimeRow';
import { DowntimeTotalFooter } from './DowntimeTotalFooter';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

interface DowntimesProps {
  downtimes: Downtimes[];
  workOrderId: string;
  currentWorkOrder: WorkOrder;
  loginUser: LoginUser | undefined;
}

export default function DowntimesComponent({
  downtimes,
  workOrderId,
  currentWorkOrder,
  loginUser,
}: DowntimesProps) {
  const { downtimesWorkorder, handleUpdate, totalTime, totalTimeString } =
    useDowntimes(downtimes, workOrderId);
  const { t } = useTranslations();

  return (
    <div className="p-2 bg-white rounded-lg w-full">
      <div className="flex flex-row items-center py-2 text-lg font-semibold">
        {t('downtimes.title')}
      </div>
      <table className="min-w-full divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-1/4"
            >
              {t('downtimes.start')}
            </th>
            <th
              scope="col"
              className="p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-1/4"
            >
              {t('downtimes.end')}
            </th>
            <th
              scope="col"
              className="p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-1/4"
            >
              {t('downtimes.total.time')}
            </th>
            <th
              scope="col"
              className="p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-1/4"
            >
              {t('downtimes.operator')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {downtimesWorkorder.map(downtime => (
            <DowntimeRow
              key={downtime.id}
              downtime={downtime}
              currentWorkOrder={currentWorkOrder}
              loginUser={loginUser}
              handleUpdate={handleUpdate}
            />
          ))}
        </tbody>
        {currentWorkOrder.stateWorkOrder === StateWorkOrder.Closed && (
          <DowntimeTotalFooter
            totalTime={totalTime}
            currentWorkOrder={currentWorkOrder}
            totalTimeString={totalTimeString}
          />
        )}
      </table>
    </div>
  );
}
