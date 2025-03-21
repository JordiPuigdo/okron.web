"use client";
import { useEffect, useState } from "react";
import WorkOrderTable from "app/(pages)/workOrders/components/WorkOrderTable";
import { WorkOrderType } from "app/interfaces/workOrder";
import { useSessionStore } from "app/stores/globalStore";

interface WorkOrderComponentProps {
  workOrderType?: WorkOrderType;
}
export default function WorkOrderComponent({
  workOrderType,
}: WorkOrderComponentProps) {
  const { operatorLogged } = useSessionStore((state) => state);
  const [operatorId, setOperatorId] = useState<string | "">("");
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    operatorLogged !== undefined
      ? setOperatorId(operatorLogged.idOperatorLogged)
      : setOperatorId("");
  }, [operatorLogged]);

  useEffect(() => {
    setRefresh(true);
  }, [workOrderType]);

  return (
    <>
      {operatorId !== "" ? (
        <WorkOrderTable
          enableDelete={false}
          enableEdit={true}
          enableFilters={false}
          operatorId={operatorId}
          enableDetail={false}
          workOrderType={workOrderType}
          refresh={refresh}
        />
      ) : (
        <></>
      )}
    </>
  );
}
