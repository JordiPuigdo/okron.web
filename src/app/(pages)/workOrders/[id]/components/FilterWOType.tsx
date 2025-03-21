"use client";
import { useState } from "react";
import { WorkOrderType } from "app/interfaces/workOrder";
import { useSessionStore } from "app/stores/globalStore";

interface FilterWOTypeProps {
  onClick: (type: WorkOrderType) => void;
}

export default function FilterWOType({ onClick }: FilterWOTypeProps) {
  const { operatorLogged } = useSessionStore((state) => state);
  const [workOrderType, setWorkOrderType] = useState<WorkOrderType | undefined>(
    undefined
  );
  if (operatorLogged == undefined) return <></>;

  function handleChange(type: WorkOrderType) {
    if (type == workOrderType) {
      setWorkOrderType(undefined);
      onClick(type);
    } else {
      setWorkOrderType(type);
      onClick(type);
    }
  }
  return (
    <div className="flex flex-row gap-4 items-center bg-white rounded-xl font-semibold  hover:cursor-pointer">
      <span
        className={`text-white rounded-full p-3 w-full text-center hover:bg-okron-btDeleteHover font-semibold  ${
          workOrderType == WorkOrderType.Corrective
            ? "bg-okron-correctiveSelected"
            : "bg-okron-corrective"
        }`}
        onClick={() => handleChange(WorkOrderType.Corrective)}
      >
        Correctius
      </span>
      <span
        className={`text-white rounded-full p-3 w-full text-center hover:bg-okron-btCreateHover font-semibold hover:cursor-pointer ${
          workOrderType == WorkOrderType.Preventive
            ? "bg-okron-preventiveSelected"
            : "bg-okron-preventive"
        }`}
        onClick={() => handleChange(WorkOrderType.Preventive)}
      >
        Preventius
      </span>
    </div>
  );
}
