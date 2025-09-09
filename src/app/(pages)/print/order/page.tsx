import React from 'react';
import { SystemConfiguration } from 'app/interfaces/Config';
import { Order } from 'app/interfaces/Order';

import { OrderBody } from './components/OrderBody';
import { OrderFooter } from './components/OrderFooter';
import { OrderHeader } from './components/OrderHeader';

async function getOrder(id: string): Promise<Order> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}orders/${id}`;
    const res = await fetch(url, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch order' + url);
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching work orders:', error);
    return {} as Order;
  }
}

async function getConfig() {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}config`;

    const res = await fetch(url, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch config');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching config:', error);
    return {} as SystemConfiguration;
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { id: string };
}) {
  const order = await getOrder(searchParams.id);

  return {
    title: order.code || 'Order',
  };
}

export default async function OrderPage({
  searchParams,
}: {
  searchParams: { id: string; parentId?: string };
}) {
  const order = await getOrder(searchParams.id);
  const config = await getConfig();
  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="flex flex-col  bg-white gap-4 p-4 w-full ">
        <OrderHeader order={order} company={config.company} />
        <OrderBody order={order} />
      </div>
      <OrderFooter order={order} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.onload = function() { window.print(); }`,
        }}
      />
    </div>
  );
}
