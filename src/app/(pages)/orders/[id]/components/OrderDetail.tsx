'use client';
import { SvgSpinner } from 'app/icons/icons';
import { orderService } from 'app/services/orderService';
import useSWR from 'swr';

import OrderForm from '../../orderForm/components/OrderForm';

interface OrderDetailProps {
  id: string;
}

export default function OrderDetail({ id }: OrderDetailProps) {
  const { data: order } = useSWR(
    ['order', id],
    ([, orderId]: [string, string]) => orderService.getById(orderId),
    { revalidateOnFocus: false, revalidateIfStale: false, revalidateOnReconnect: false }
  );

  if (order) return <OrderForm isPurchase={false} orderRequest={order} />;
  return <SvgSpinner className="w-full" />;
}
