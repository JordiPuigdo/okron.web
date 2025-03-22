import { OrderSimple } from 'app/interfaces/Order';
import { formatDate } from 'app/utils/utils';
import { translateOrderStatus } from 'app/utils/utilsOrder';

export interface OrderPurchaseProps {
  order: OrderSimple;
}

export default function OrderPurchase({ order }: OrderPurchaseProps) {
  return (
    <div className="flex felx-col gap-4 justify-between border rounded-xl p-2">
      <div className="flex flex-col gap-y-2">
        <div className="flex justify-between gap-4">
          <div className="text-sm font-medium text-gray-900">Ordre Compra:</div>
          <div className="text-sm text-gray-500">
            {order.code} - {formatDate(order.creationDate)}
          </div>
        </div>
        <div className="flex justify-between gap-4">
          <div className="text-sm font-medium text-gray-900">Proveïdor:</div>
          <div className="text-sm text-gray-500">
            {order.provider?.name} - {order.provider?.nie}
          </div>
        </div>
      </div>
      <div>
        <div className="flex justify-between gap-4">
          <div className="text-sm font-medium text-gray-900">Comentari:</div>
          <div className="text-sm text-gray-500">{order.comment}</div>
        </div>
        <div className="flex justify-between gap-4">
          <div className="text-sm font-medium text-gray-900">Estat:</div>
          <div className="text-sm text-gray-500">
            {translateOrderStatus(order.status)}
          </div>
        </div>
      </div>
    </div>
  );
}
