import WorkOrder, { WorkOrderType } from 'app/interfaces/workOrder';
import { formatDate } from 'app/utils/utils';

export const WorkOrderHeader = ({ workOrder }: { workOrder: WorkOrder }) => {
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL!;
  return (
    <div className="flex flex-col p-2">
      <div className="flex justify-between">
        <img
          src={logoUrl}
          alt="Components Mecànics Logo"
          className="h-[120px] w-[120px]"
        />
        <div className="flex flex-col justify-center items-end">
          <h1 className="text-l font-bold">{workOrder.code}</h1>
          <p className="text-l font-bold">{workOrder.description}</p>
          <p className="text-l font-semibold">{workOrder.asset?.description}</p>
          <p className="text-l font-semibold">
            {formatDate(workOrder.startTime, false)}
          </p>
          {workOrder.workOrderType == WorkOrderType.Preventive && (
            <p>{workOrder.preventive?.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};
