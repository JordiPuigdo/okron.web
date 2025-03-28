'use client';
import { useEffect, useState } from 'react';
import { useOrder } from 'app/hooks/useOrder';
import { Order } from 'app/interfaces/Order';

import OrderForm from '../../orderForm/components/OrderForm';

interface OrderDetailProps {
  id: string;
  isPdf: boolean;
}

export default function OrderDetail({ id, isPdf }: OrderDetailProps) {
  const { fetchOrderById } = useOrder();
  const [order, setOrder] = useState<Order | null>(null);

  const fetchOrder = async () => {
    const response = await fetchOrderById(id);
    setOrder(response);
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (order)
    return <OrderForm isPurchase={false} orderRequest={order!} isPdf={isPdf} />;
  return <div>Cargando...</div>;
}
