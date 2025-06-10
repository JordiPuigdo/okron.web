import WorkOrder, { WorkOrderType } from 'app/interfaces/workOrder';
import Loader from 'components/Loader/loader';

import { HoursOperator } from './components/hoursOperator';
import { WorkOrderComment } from './components/workorderComment';
import { WorkOrderHeader } from './components/workorderHeader';
import { WorkOrderPreventiveReport } from './components/workorderPreventiveReport';
import { WorkOrderSparePartsReport } from './components/workorderSparePartsReport';

async function getWorkOrders(id: string): Promise<WorkOrder> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}workOrder/${id}`;
    const res = await fetch(url, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch work orders');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching work orders:', error);
    return {} as WorkOrder;
  }
}
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { id: string };
}) {
  const orders = await getWorkOrders(searchParams.id);
  return {
    title: orders.code || 'Work Order',
  };
}

export default async function WorkOrderPage({
  searchParams,
}: {
  searchParams: { id: string; parentId?: string };
}) {
  const orders = await getWorkOrders(searchParams.id);

  return (
    <div className="min-h-screen flex flex-col items-center">
      {orders == undefined && <Loader />}
      <div className="flex flex-col  bg-white gap-4 p-4 w-full ">
        <WorkOrderHeader workOrder={orders} />
        <HoursOperator workOrder={orders} />
        {orders.workOrderType == WorkOrderType.Preventive && (
          <WorkOrderPreventiveReport workorder={orders} />
        )}
        <WorkOrderSparePartsReport workorder={orders} />
        <WorkOrderComment workorder={orders} />
        <div className="flex font-semibold p-10">Firma:</div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.onload = function() { window.print(); }`,
        }}
      />
    </div>
  );
}
