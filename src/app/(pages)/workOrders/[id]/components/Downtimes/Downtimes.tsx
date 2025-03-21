import { useDowntimes } from 'app/hooks/useDowntimeComponent';
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

  return (
    <div className="p-2 bg-white rounded-lg w-full">
      <div className="flex flex-row items-center py-2 text-lg font-semibold">
        Aturada Producció
      </div>
      <table className="min-w-full divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-1/4"
            >
              Inici
            </th>
            <th
              scope="col"
              className="p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-1/4"
            >
              Fi
            </th>
            <th
              scope="col"
              className="p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-1/4"
            >
              Temps Total
            </th>
            <th
              scope="col"
              className="p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-1/4"
            >
              Operari
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
