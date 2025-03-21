import React, { useEffect, useState } from "react";
import ModalGenerateCorrective from "app/(pages)/corrective/components/ModalGenerateCorrective";
import { SvgSpinner } from "app/icons/icons";
import WorkOrder, {
  ResultInspectionPoint,
  SaveInspectionResultPointRequest,
  StateWorkOrder,
  WorkOrderInspectionPoint,
} from "app/interfaces/workOrder";
import WorkOrderService from "app/services/workOrderService";
import { useGlobalStore, useSessionStore } from "app/stores/globalStore";
import { checkAllInspectionPoints } from "app/utils/utilsInspectionPoints";

interface CompleteInspectionPointsProps {
  workOrderInspectionPoints: WorkOrderInspectionPoint[];
  setCompletedWorkOrderInspectionPoints: React.Dispatch<
    React.SetStateAction<WorkOrderInspectionPoint[]>
  >;
  workOrderId: string;
  isFinished: boolean;
  workOrder?: WorkOrder;
}

const CompleteInspectionPoints: React.FC<CompleteInspectionPointsProps> = ({
  workOrderInspectionPoints,
  setCompletedWorkOrderInspectionPoints,
  workOrderId,
  isFinished,
  workOrder,
}) => {
  const workOrderService = new WorkOrderService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ""
  );
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [description, setDescription] = useState<string | null>(null);
  const { operatorLogged } = useSessionStore((state) => state);
  const { isModalOpen, setIsModalOpen } = useGlobalStore((state) => state);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isModalOpen) {
      setShowModal(false);
    }
  }, [isModalOpen]);

  const handleSelectInspectionPoint = async (
    inspectionPoint: WorkOrderInspectionPoint,
    e: any
  ) => {
    if (operatorLogged == undefined) {
      alert("Has de tenir un operari fitxat per fer aquesta acció!");
      return;
    }
    setIsLoading((prevLoadingMap) => ({
      ...prevLoadingMap,
      [inspectionPoint.id]: true,
    }));
    const saveInspectionPointResult: SaveInspectionResultPointRequest = {
      WorkOrderId: workOrderId,
      WorkOrderInspectionPointId: inspectionPoint.id,
      resultInspectionPoint:
        e == true ? ResultInspectionPoint.Ok : ResultInspectionPoint.NOk,
    };
    await workOrderService
      .saveInspectionPointResult(saveInspectionPointResult)
      .then((response) => {
        setCompletedWorkOrderInspectionPoints((prevSelected) =>
          prevSelected.map((point) =>
            point.id === inspectionPoint.id ? { ...point, check: e } : point
          )
        );
      })
      .catch((error) => {
        setIsLoading((prevLoadingMap) => ({
          ...prevLoadingMap,
          [inspectionPoint.id]: false,
        }));
        console.log("Error insepctionPoint: " + error);
      });
    setIsLoading((prevLoadingMap) => ({
      ...prevLoadingMap,
      [inspectionPoint.id]: false,
    }));
  };

  const handleResetInspectionPoint = async (
    inspectionPoint: WorkOrderInspectionPoint
  ) => {
    if (operatorLogged == undefined) {
      alert("Has de tenir un operari fitxat per fer aquesta acció!");
      return;
    }
    setIsLoading((prevLoadingMap) => ({
      ...prevLoadingMap,
      [inspectionPoint.id]: true,
    }));
    const x = undefined;

    const saveInspectionPointResult: SaveInspectionResultPointRequest = {
      WorkOrderId: workOrderId,
      WorkOrderInspectionPointId: inspectionPoint.id,
      resultInspectionPoint: ResultInspectionPoint.Pending,
    };
    await workOrderService
      .saveInspectionPointResult(saveInspectionPointResult)
      .then((response) => {
        setCompletedWorkOrderInspectionPoints((prevSelected) =>
          prevSelected.map((point) =>
            point.id === inspectionPoint.id ? { ...point, check: x } : point
          )
        );
      })
      .catch((error) => {
        setIsLoading((prevLoadingMap) => ({
          ...prevLoadingMap,
          [inspectionPoint.id]: false,
        }));
        console.log("Error Operaris: " + error);
      });
    setIsLoading((prevLoadingMap) => ({
      ...prevLoadingMap,
      [inspectionPoint.id]: false,
    }));
  };

  async function handleAllChecksOk() {
    setIsLoading((prevLoadingMap) => ({
      ...prevLoadingMap,
      ["OK"]: true,
    }));
    const result = await checkAllInspectionPoints(
      workOrderInspectionPoints,
      workOrderId
    );
    setCompletedWorkOrderInspectionPoints(result);
    setIsLoading((prevLoadingMap) => ({
      ...prevLoadingMap,
      ["OK"]: false,
    }));
  }

  return (
    <div className="p-2 bg-white rounded-lg shadow-md w-full">
      <div
        className={`flex gap-2 p-2  rounded-xl justify-center font-semibold text-white   ${
          isFinished
            ? "bg-gray-500 cursor-default"
            : "bg-green-500 hover:bg-green-700 cursor-pointer "
        }`}
        onClick={(e) => {
          !isFinished && handleAllChecksOk();
        }}
      >
        Marcar tots OK
        {isLoading["OK"] && <SvgSpinner className="w-6 h-6" />}
      </div>
      <div className="py-4 overflow-x-auto rounded-sm">
        <table className="w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Check
              </th>
              <th className="p-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Punt de inspecció
              </th>
              <th className="p-2 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                Reset
              </th>
              <th className="p-2 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                Avaria
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {workOrderInspectionPoints.map((inspectionPoint) => (
              <tr
                key={inspectionPoint.id}
                className={
                  inspectionPoint.check === false
                    ? "bg-red-100"
                    : inspectionPoint.check === true
                    ? "bg-green-100"
                    : "bg-orange-100"
                }
              >
                <td className="p-2 text-left align-middle">
                  <input
                    disabled={isFinished}
                    type="checkbox"
                    checked={inspectionPoint.check || false}
                    onChange={(event) => {
                      handleSelectInspectionPoint(
                        inspectionPoint,
                        event.target.checked
                      );
                    }}
                    className="w-6 h-6 cursor-pointer"
                  />
                </td>
                <td className="p-2 text-left align-middle text-lg">
                  {inspectionPoint.inspectionPoint.description}
                </td>
                <td
                  className="p-2 text-left align-middle"
                  onClick={() => {
                    handleResetInspectionPoint(inspectionPoint);
                  }}
                >
                  <button
                    disabled={isFinished}
                    type="button"
                    className="border border-gray-700 rounded-xl p-2 gap-2 bg-slate-500 text-white w-full text-lg flex items-center justify-center"
                  >
                    Reset
                    {isLoading[inspectionPoint.id] && <SvgSpinner />}
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    className="border border-gray-700 rounded-xl p-2 gap-2 bg-red-700 text-white w-full text-lg flex items-center justify-center"
                    onClick={() => {
                      setDescription(
                        inspectionPoint.inspectionPoint.description
                      );
                      setShowModal(true);
                    }}
                  >
                    Crear
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <ModalGenerateCorrective
          assetId={workOrder?.asset?.id!}
          description={description != null ? description : ""}
          stateWorkOrder={StateWorkOrder.OnGoing}
          operatorIds={workOrder?.operatorId}
        />
      )}
    </div>
  );
};

export default CompleteInspectionPoints;
