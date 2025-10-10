import { SystemConfiguration } from 'app/interfaces/Config';
import { Order } from 'app/interfaces/Order';

import PrintTrigger from '../components/PrintTrigger';
import { OrderBody } from './components/OrderBody';
import { OrderFooter } from './components/OrderFooter';
import { OrderHeader } from './components/OrderHeader';

async function getOrder(id: string): Promise<Order> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}orders/${id}`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`❌ Failed to fetch order: ${url}`);
  }

  return res.json();
}

async function getConfig(): Promise<SystemConfiguration> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}config`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('❌ Failed to fetch config');
  }

  return res.json();
}

interface OrderPageProps {
  searchParams: { id: string; parentId?: string };
}

export default async function OrderPage({ searchParams }: OrderPageProps) {
  const [order, config] = await Promise.all([
    getOrder(searchParams.id),
    getConfig(),
  ]);

  if (!order || !config) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* PrintTrigger se encarga de hacer window.print() en el cliente */}
      <PrintTrigger />
      <div className="flex flex-col bg-white gap-4 p-4 w-full">
        <OrderHeader order={order} company={config.company} />
        <OrderBody order={order} />
      </div>
      <OrderFooter order={order} />
    </div>
  );
}
