'use client';

import React, { useEffect, useState } from 'react';
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

interface OrderPageProps {
  searchParams: { id: string; parentId?: string };
}

export default function OrderPage({ searchParams }: OrderPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [config, setConfig] = useState<SystemConfiguration | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const orderData = await getOrder(searchParams.id);
      const configData = await getConfig();
      setOrder(orderData);
      setConfig(configData);
    };
    loadData();
  }, [searchParams.id]);

  useEffect(() => {
    if (order && config) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [order, config]);

  if (!order || !config) {
    return <div>Loading...</div>;
  }
  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="flex flex-col  bg-white gap-4 p-4 w-full ">
        <OrderHeader order={order} company={config.company} />
        <OrderBody order={order} />
      </div>
      <OrderFooter order={order} />
    </div>
  );
}
