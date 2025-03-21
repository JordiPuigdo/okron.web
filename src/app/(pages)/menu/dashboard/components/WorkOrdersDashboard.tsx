import WorkOrder, { WorkOrderType } from 'app/interfaces/workOrder';
import { translateWorkOrderType } from 'app/utils/utils';
import dayjs from 'dayjs';

interface WorkOrdersDashboardProps {
  workOrders: WorkOrder[];
}

const WorkOrdersDashboard: React.FC<WorkOrdersDashboardProps> = ({
  workOrders,
}) => {
  const calculateTotalTime = (workOrder: WorkOrder) => {
    let totalTime = 0;

    workOrder.workOrderOperatorTimes?.forEach(time => {
      const startTime = new Date(time.startTime).getTime();
      const endTime = time.endTime ? new Date(time.endTime).getTime() : null;

      if (endTime && startTime < endTime) {
        const timeDifference = endTime - startTime;
        totalTime += timeDifference;
      }
    });

    return totalTime / (1000 * 60);
  };

  const calculateTotalCost = (workOrder: WorkOrder) => {
    let totalCost = 0;

    workOrder.workOrderSpareParts?.forEach(sparePart => {
      totalCost += sparePart.quantity * sparePart.sparePart.price;
    });

    return totalCost;
  };

  const groupedWorkOrders = workOrders.reduce((acc, workOrder) => {
    const dayKey = dayjs(workOrder.startTime).format('DD/MM/YYYY');
    const typeKey = workOrder.workOrderType;
    const totalTime = calculateTotalTime(workOrder);
    const totalCost = calculateTotalCost(workOrder);

    if (!acc[dayKey]) {
      acc[dayKey] = {};
    }

    if (!acc[dayKey][typeKey]) {
      acc[dayKey][typeKey] = { count: 0, totalTime: 0, totalCost: 0 };
    }

    acc[dayKey][typeKey].count += 1;
    acc[dayKey][typeKey].totalTime += totalTime;
    acc[dayKey][typeKey].totalCost += totalCost;

    return acc;
  }, {} as Record<string, Record<string, { count: number; totalTime: number; totalCost: number }>>);

  return (
    <div className="flex flex-col bg-white gap-4 w-full items-center p-4 rounded-xl ">
      <div className="w-full max-h-64 overflow-y-auto">
        <table className="table-auto w-full border-collapse">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="text-left text-gray-400 text-sm">
              <th className="p-3">Data</th>
              <th className="p-3">Tipus</th>
              <th>Total OTs</th>
              <th>Minuts</th>
              <th className="p-3 text-right">Cost</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {Object.entries(groupedWorkOrders).map(([day, types], index) =>
              Object.entries(types).map(([type, data]) => {
                const isEvenRow = index % 2 === 0;
                return (
                  <tr
                    key={`${day}-${type}`}
                    className={`${isEvenRow ? 'bg-gray-50' : ''} `}
                  >
                    <td className="p-3 whitespace-nowrap">{day}</td>
                    <td
                      className={`p-3 ${
                        type.toString() === '0'
                          ? 'text-red-500'
                          : 'text-blue-500'
                      } font-semibold`}
                    >
                      {translateWorkOrderType(type as unknown as WorkOrderType)}
                    </td>
                    <td className="p-3">{data.count}</td>
                    <td className="p-3">{Math.round(data.totalTime)}</td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {Math.round(data.totalCost)} €
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkOrdersDashboard;
