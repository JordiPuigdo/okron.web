import WorkOrder from 'app/interfaces/workOrder';
import { translateStateWorkOrder } from 'app/utils/utils';
import dayjs from 'dayjs';

interface WorkOrderListProps {
  workOrders: WorkOrder[];
}

const WorkOrderList = ({ workOrders }: WorkOrderListProps) => {
  const now = new Date();

  if (workOrders.length === 0) {
    return (
      <p className="text-gray-500">No se encontraron órdenes de trabajo</p>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Ordres de treball</h3>
      <ul className="divide-y divide-gray-200">
        {workOrders.map(order => (
          <li
            key={order.id}
            className={`py-3 ${
              dayjs(order.creationDate).isAfter(now) ? 'bg-yellow-200' : ''
            }`}
          >
            <p className="font-medium">
              {order.code} - {order.description}
            </p>
            <div className="flex gap-4">
              <p className="text-sm text-gray-500">
                {translateStateWorkOrder(order.stateWorkOrder)}
              </p>
              <p className="text-sm text-gray-500">
                {dayjs(order.creationDate).format('DD/MM/YYYY')}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkOrderList;
