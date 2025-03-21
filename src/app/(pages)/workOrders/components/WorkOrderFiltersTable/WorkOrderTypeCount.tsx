import { WorkOrderType } from 'app/interfaces/workOrder';
import { translateWorkOrderType } from 'app/utils/utils';

export interface WorkOrderTypeCount {
  workOrderType: WorkOrderType;
  count: number;
}

interface WorkOrderTypeCountProps {
  workOrderTypeCount: WorkOrderTypeCount[];
}
function getBgColor(type: WorkOrderType) {
  switch (type) {
    case WorkOrderType.Corrective:
      return 'bg-okron-corrective';
    case WorkOrderType.Preventive:
      return 'bg-okron-preventive';
    case WorkOrderType.Ticket:
      return 'bg-okron-btDetail';
    default:
      return 'bg-gray-200';
  }
}

export const WorkOrderTypeCountComponent = ({
  workOrderTypeCount,
}: WorkOrderTypeCountProps) => {
  return (
    <div className="flex items-center h-full">
      {workOrderTypeCount.map((typeCount, index) => (
        <div
          key={index}
          className={`flex items-center justify-center ml-2 p-2 rounded-xl ${getBgColor(
            typeCount.workOrderType
          )} h-[40px]`}
        >
          <div className="flex flex-row gap-2">
            <div className="text-sm text-white">
              {translateWorkOrderType(typeCount.workOrderType)}
            </div>
            <div className="text-sm font-semibold text-white">
              {typeCount.count}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
