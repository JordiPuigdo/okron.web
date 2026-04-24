import { useTranslations } from 'app/hooks/useTranslations';
import { WorkOrderType } from 'app/interfaces/workOrder';
import { translateWorkOrderType } from 'app/utils/utils';

export interface WorkOrderTypeCount {
  workOrderType: WorkOrderType;
  count: number;
  withCorrectiveCount?: number;
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

  const {t} = useTranslations();

  return (
    <div className="flex items-center h-full">
      {workOrderTypeCount.map((typeCount, index) => (
        <div
          key={index}
          className={`flex items-center justify-center ml-2 p-2 rounded-xl ${getBgColor(
            typeCount.workOrderType
          )} h-[40px] flex-shrink-0 whitespace-nowrap`}
        >
          <div className="flex flex-row gap-2">
            <div className="text-sm text-white">
              {translateWorkOrderType(typeCount.workOrderType, t)}
            </div>
            <div className="text-sm font-semibold text-white">
              {typeCount.count}
              {typeCount.workOrderType === WorkOrderType.Ticket &&
                typeCount.withCorrectiveCount !== undefined && (
                  <span className="text-xs font-normal text-white ml-1">
                    ({typeCount.withCorrectiveCount}{' '}
                    {t('workorder.filters.corrective.withOT') || 'amb OT'})
                  </span>
                )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
