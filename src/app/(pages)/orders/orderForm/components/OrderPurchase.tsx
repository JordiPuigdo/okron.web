import { useTranslations } from 'app/hooks/useTranslations';
import { OrderSimple } from 'app/interfaces/Order';
import { formatDate } from 'app/utils/utils';
import { translateOrderStatus } from 'app/utils/utilsOrder';
import Link from 'next/link';

export interface OrderPurchaseProps {
  order: OrderSimple;
}

export default function OrderPurchase({ order }: OrderPurchaseProps) {
  const { t } = useTranslations();
  return (
    <div className="flex felx-col gap-4 justify-between border rounded-xl p-2">
      <div className="flex flex-col gap-y-2">
        <div className="flex justify-between gap-4">
          <div className="text-sm font-medium text-gray-900">{t('order')}:</div>
          <div className="text-sm text-gray-500">
            <Link
              href={`/orders/${order.id}`}
              className="text-blue-500 hover:cursor-pointer hover:underline"
            >
              {order.code} - {formatDate(order.creationDate, false)}
            </Link>
          </div>
        </div>
        <div className="flex justify-between gap-4">
          <div className="text-sm font-medium text-gray-900">{t('provider')}:</div>
          <div className="text-sm text-gray-500">
            {order.provider?.name} - {order.provider?.nie}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-2">
        <div className="flex justify-between gap-4">
          <div className="text-sm font-medium text-gray-900">{t('comment')}:</div>
          <div className="text-sm text-gray-500">{order.comment}</div>
        </div>
        <div className="flex justify-between gap-4">
          <div className="text-sm font-medium text-gray-900">{t('state')}:</div>
          <div className="text-sm text-gray-500">
            {translateOrderStatus(order.status, t)}
          </div>
        </div>
      </div>
    </div>
  );
}
