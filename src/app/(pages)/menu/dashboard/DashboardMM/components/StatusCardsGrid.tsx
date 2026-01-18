import { StateWorkOrder } from 'app/interfaces/workOrder';

import { StatusCard } from './StatusCard';

interface WorkOrderStateChartProps {
  statWorkOrder: StateWorkOrder;
  value: number;
  color: string;
}

interface StatusCardsGridProps {
  workOrderStates: WorkOrderStateChartProps[];
  translateFn: (state: StateWorkOrder) => string;
  startDate?: Date | null;
  endDate?: Date | null;
}

export const StatusCardsGrid: React.FC<StatusCardsGridProps> = ({
  workOrderStates,
  translateFn,
  startDate,
  endDate,
}) => {
  return (
    <div className="w-full overflow-hidden">
      {/* Grid responsive de status cards */}
      <div
        className="
          grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 
          gap-3 lg:gap-4
          w-full
          p-1
        "
      >
        {workOrderStates.map((workOrderState, index) => (
          <div
            key={workOrderState.statWorkOrder}
            className="animate-fadeIn"
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'backwards',
            }}
          >
            <StatusCard
              state={workOrderState.statWorkOrder}
              value={workOrderState.value}
              label={translateFn(workOrderState.statWorkOrder)}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusCardsGrid;
