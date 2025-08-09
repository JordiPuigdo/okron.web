import WorkOrder, { WorkOrderType } from 'app/interfaces/workOrder';
import { formatDate } from 'app/utils/utils';

export const WorkOrderHeader = ({ workOrder }: { workOrder: WorkOrder }) => {
  //  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL!;
  return (
    <div className="flex justify-between items-center md:items-start gap-4 p-2">
      <div className="flex flex-col items-end text-right">
        <h1 className="text-base font-bold">{workOrder.code}</h1>
        <p className="text-sm font-bold">{workOrder.description}</p>
        <p className="text-sm font-semibold">{workOrder.asset?.description}</p>
        <p className="text-sm font-semibold">
          {formatDate(workOrder.startTime, false)}
        </p>
        {workOrder.workOrderType === WorkOrderType.Preventive && (
          <p className="text-sm">{workOrder.preventive?.description}</p>
        )}
      </div>
    </div>
  );
};
