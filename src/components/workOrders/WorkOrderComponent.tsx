'use client';

import WorkOrderTable from 'app/(pages)/workOrders/components/WorkOrderTable';
import { WorkOrderType } from 'app/interfaces/workOrder';
import { useSessionStore } from 'app/stores/globalStore';

interface WorkOrderComponentProps {
  workOrderType?: WorkOrderType;
}
export default function WorkOrderComponent({
  workOrderType,
}: WorkOrderComponentProps) {
  const { operatorLogged } = useSessionStore(state => state);

  return (
    <>
      {operatorLogged ? (
        <WorkOrderTable
          enableDelete={false}
          enableEdit={true}
          enableFilters={false}
          operatorId={operatorLogged.idOperatorLogged}
          enableDetail={false}
          workOrderType={workOrderType}
        />
      ) : (
        <></>
      )}
    </>
  );
}
