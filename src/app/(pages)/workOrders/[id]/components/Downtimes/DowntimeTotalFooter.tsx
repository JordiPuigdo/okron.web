import { calculateTotalSecondsBetweenDates } from 'app/(pages)/reports/downtimesReport/component/downtimeUtils';
import WorkOrder from 'app/interfaces/workOrder';

interface DowntimeRowFooterProps {
  totalTime: number;
  currentWorkOrder: WorkOrder;
  totalTimeString: (time: number) => void;
}

export function DowntimeTotalFooter({
  totalTime,
  currentWorkOrder,
  totalTimeString,
}: DowntimeRowFooterProps) {
  return (
    <tfoot className="bg-white divide-y divide-gray-200">
      <tr>
        <td colSpan={1}></td>
        <td className=" whitespace-nowrap text-sm text-gray-900 font-bold">
          Temps Total
        </td>
        <td
          colSpan={2}
          className="p-2 whitespace-nowrap text-sm text-gray-900 font-bold"
        >
          {totalTimeString(totalTime)}
        </td>
      </tr>
      {currentWorkOrder.downtimes !== undefined &&
        currentWorkOrder.downtimes.map((downtime, index) => (
          <tr key={index}>
            <td colSpan={3}></td>
            <td className="p-2 whitespace-nowrap text-sm text-gray-900 font-bold">
              {downtime.operator.name} -{' '}
              {totalTimeString(
                calculateTotalSecondsBetweenDates(
                  downtime.startTime,
                  downtime.endTime
                )
              )}
            </td>
          </tr>
        ))}
    </tfoot>
  );
}
