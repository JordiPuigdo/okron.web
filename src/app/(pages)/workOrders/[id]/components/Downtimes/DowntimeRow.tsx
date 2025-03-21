import { EditableCell } from 'app/(pages)/machines/downtimes/components/EditingCell';
import { Downtimes } from 'app/interfaces/Production/Downtimes';
import { LoginUser, UserType } from 'app/interfaces/User';
import WorkOrder, { StateWorkOrder } from 'app/interfaces/workOrder';
import {
  formatDate,
  formatTimeSpan,
  translateOperatorType,
} from 'app/utils/utils';

interface DowntimeRowProps {
  downtime: Downtimes;
  currentWorkOrder: WorkOrder;
  loginUser: LoginUser | undefined;
  handleUpdate: (id: string, newValue: string, isStart: boolean) => void;
}

export function DowntimeRow({
  downtime,
  currentWorkOrder,
  loginUser,
  handleUpdate,
}: DowntimeRowProps) {
  const isEditable =
    currentWorkOrder.stateWorkOrder !== StateWorkOrder.Closed &&
    loginUser?.userType === UserType.Production;

  return (
    <tr>
      <td className="p-2 whitespace-nowrap w-1/4">
        {isEditable ? (
          <EditableCell
            value={formatDate(downtime.startTime)}
            onUpdate={newValue => handleUpdate(downtime.id, newValue, true)}
          />
        ) : (
          <label>{formatDate(downtime.startTime)}</label>
        )}
      </td>
      <td className="p-2 whitespace-nowrap w-1/4">
        {isEditable ? (
          <EditableCell
            value={formatDate(downtime.endTime)}
            onUpdate={newValue => handleUpdate(downtime.id, newValue, false)}
          />
        ) : (
          <label>{formatDate(downtime.endTime)}</label>
        )}
      </td>
      <td className="p-2 whitespace-nowrap w-1/4">
        {downtime.totalTime ? formatTimeSpan(downtime.totalTime) : 'N/A'}
      </td>
      <td className="p-2 whitespace-nowrap w-1/4">
        {downtime.operator.name} -{' '}
        {translateOperatorType(downtime.operator.operatorType)}
      </td>
    </tr>
  );
}
