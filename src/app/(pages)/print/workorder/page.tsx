import { SystemConfiguration } from 'app/interfaces/Config';
import { WorkOrderType } from 'app/interfaces/workOrder';
import { getConfig, getWorkOrders } from 'app/lib/api';
import Loader from 'components/Loader/loader';

import { AutoPrint } from './components/AutoPrint';
import { HoursOperator } from './components/hoursOperator';
import ReportDataCard from './components/ReportDataCard';
import { Signatures } from './components/Signature';
import { WorkOrderComment } from './components/workorderComment';
import { WorkOrderHeader } from './components/workorderHeader';
import { WorkOrderPreventiveReport } from './components/workorderPreventiveReport';
import { WorkOrderSparePartsReport } from './components/workorderSparePartsReport';
import { WorkOrderTicketPrint } from './components/WorkOrderTicketPrint';

interface WorkOrderPageProps {
  searchParams: { id: string; parentId?: string };
}

export default async function WorkOrderPage({
  searchParams,
}: WorkOrderPageProps) {
  const { id } = searchParams;

  if (!id) {
    return <div className="p-4 text-red-500">Missing work order ID</div>;
  }

  let orders, relatedWorkOrder, config: SystemConfiguration;

  try {
    [orders, config] = await Promise.all([getWorkOrders(id), getConfig()]);
    if (orders.workOrderCreatedId) {
      [relatedWorkOrder] = await Promise.all([
        getWorkOrders(orders.workOrderCreatedId),
      ]);
    }
  } catch (error) {
    console.error(error);
    return <div className="p-4 text-red-500">Failed to load data</div>;
  }

  if (!orders || !config) return <Loader />;

  return (
    <div className="px-2 sm:px-4 max-w-[100vw] overflow-x-hidden text-sm">
      <AutoPrint enabled={!!orders && !!config} />
      {config.isCRM ? (
        <div className="flex flex-col bg-white p-4 w-full gap-6">
          <WorkOrderHeader workOrder={orders} config={config} />
          <ReportDataCard workOrder={orders} />
          {orders.customerSign && orders.workerSign && (
            <Signatures
              customerSign={orders.customerSign}
              workerSign={orders.workerSign}
            />
          )}
        </div>
      ) : orders.workOrderType == WorkOrderType.Ticket ? (
        <WorkOrderTicketPrint
          workOrder={orders}
          config={config}
          relatedWorkOrder={relatedWorkOrder}
        />
      ) : (
        <div>
          <WorkOrderHeader workOrder={orders} config={config} />
          <HoursOperator workOrder={orders} />
          {orders.workOrderType === WorkOrderType.Preventive && (
            <WorkOrderPreventiveReport workorder={orders} />
          )}
          <WorkOrderSparePartsReport workorder={orders} />
          <WorkOrderComment workorder={orders} />
        </div>
      )}
    </div>
  );
}
