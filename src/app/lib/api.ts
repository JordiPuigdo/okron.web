import { DeliveryNote } from 'app/interfaces';
import { SystemConfiguration } from 'app/interfaces/Config';
import WorkOrder from 'app/interfaces/workOrder';

export async function getWorkOrders(id: string): Promise<WorkOrder> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}workOrder/${id}`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok)
    throw new Error(`Failed to fetch work orders ${url} ${res.status}`);
  return res.json();
}

export async function getConfig(): Promise<SystemConfiguration> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}config`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) throw new Error('Failed to fetch config');
  return res.json();
}

export async function getDeliveryNote(id: string): Promise<DeliveryNote> {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}deliverynotes/${id}`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok)
    throw new Error(`Failed to fetch delivery note ${url} ${res.status}`);
  return res.json();
}
