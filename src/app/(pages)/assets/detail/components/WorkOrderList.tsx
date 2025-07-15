import { useState } from 'react';
import { SvgSpinner } from 'app/icons/icons';
import WorkOrder from 'app/interfaces/workOrder';
import { translateStateWorkOrder } from 'app/utils/utils';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

interface WorkOrderListProps {
  workOrders: WorkOrder[];
}

const WorkOrderList = ({ workOrders }: WorkOrderListProps) => {
  const now = new Date();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | undefined>(undefined);

  if (workOrders.length === 0) {
    return (
      <p className="text-gray-500">No se encontraron órdenes de trabajo</p>
    );
  }

  const handleClickWorkOrder = (id: string) => {
    setIsLoading(id);
    router.push(`/print/workorder?id=${id}`);
  };

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
            onClick={() =>
              !dayjs(order.creationDate).isAfter(now) &&
              handleClickWorkOrder(order.id)
            }
          >
            <p className="font-medium flex items-center gap-2">
              {order.code} - {order.description}{' '}
              {isLoading == order.id && (
                <SvgSpinner className="text-okron-main" />
              )}
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
