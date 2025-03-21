'use client';
import { useState } from 'react';
import GeneratePreventive from 'app/(pages)/preventive/components/GeneratePreventive';
import FilterWOType from 'app/(pages)/workOrders/[id]/components/FilterWOType';
import FinalizeWorkOrdersDaysBefore from 'app/(pages)/workOrders/components/FinalizeWorkOrdersDaysBefore';
import { UserPermission, UserType } from 'app/interfaces/User';
import { WorkOrderType } from 'app/interfaces/workOrder';
import { useSessionStore } from 'app/stores/globalStore';
import SignOperator from 'components/operator/SignOperator';
import WorkOrderComponent from 'components/workOrders/WorkOrderComponent';

export const HeaderMenu = () => {
  const { loginUser } = useSessionStore(state => state);
  const [workOrderType, setWorkOrderType] = useState<WorkOrderType | undefined>(
    undefined
  );
  function handleFilterWOType(type: WorkOrderType) {
    if (workOrderType == type) {
      setWorkOrderType(undefined);
      return;
    }
    setWorkOrderType(type);
  }
  return (
    <>
      {/* <div className="flex flex-row gap-4 bg-white p-4 rounded-xl">
        <FilterWOType onClick={handleFilterWOType} />
      </div> */}
      <div className="pt-5">
        <WorkOrderComponent workOrderType={workOrderType} />
      </div>
    </>
  );
};
