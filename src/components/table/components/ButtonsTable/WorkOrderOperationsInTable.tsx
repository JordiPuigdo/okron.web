import React, { useEffect, useState } from 'react';
import { useSparePartsHook } from 'app/hooks/useSparePartsHook';
import {
  SvgCheck,
  SvgClose,
  SvgDetail,
  SvgInspectionPoints,
  SvgPause,
  SvgSparePart,
  SvgSpinner,
  SvgStart,
} from 'app/icons/icons';
import { UserType } from 'app/interfaces/User';
import WorkOrder, {
  StateWorkOrder,
  UpdateStateWorkOrder,
  WorkOrderSparePart,
  WorkOrderType,
} from 'app/interfaces/workOrder';
import WorkOrderService from 'app/services/workOrderService';
import { useGlobalStore, useSessionStore } from 'app/stores/globalStore';
import useRoutes from 'app/utils/useRoutes';
import { checkAllInspectionPoints } from 'app/utils/utilsInspectionPoints';
import ChooseSpareParts from 'components/sparePart/ChooseSpareParts';
import { Button } from 'designSystem/Button/Buttons';
import { Modal } from 'designSystem/Modals/Modal';

import WorkOrderOperationsInTableToolTips from './WorkOrderOperationsInTableToolTips';

interface WorkOrderOperationsInTableProps {
  workOrderId: string;
  workOrder: WorkOrder;
  onChangeStateWorkOrder?: () => void;
  enableActions?: boolean;
}

export default function WorkOrderOperationsInTable({
  workOrderId,
  workOrder,
  onChangeStateWorkOrder,
  enableActions = true,
}: WorkOrderOperationsInTableProps) {
  const [isPassInspectionPoints, setIsPassInspectionPoints] =
    React.useState(false);

  const workOrderService = new WorkOrderService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );

  const Routes = useRoutes();
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

  const { operatorLogged, loginUser } = useSessionStore(state => state);
  const { isModalOpen } = useGlobalStore(state => state);
  const [showModal, setShowModal] = useState(false);

  function handleInspectionPoints(workOrderId: string) {
    if (!operatorLogged) {
      alert('Has de tenir un operari fitxat per fer aquesta acció');
      return;
    }
    toggleLoading(workOrderId + '_InspectionPoints');
    checkAllInspectionPoints(workOrder.workOrderInspectionPoint!, workOrderId);
    setIsPassInspectionPoints(!isPassInspectionPoints);
    toggleLoading(workOrderId + '_InspectionPoints');
    setIsPassInspectionPoints(!isPassInspectionPoints);
  }

  const toggleLoading = (id: string) => {
    setIsLoading(prevLoading => ({
      ...prevLoading,
      [id]: !prevLoading[id],
    }));
  };

  useEffect(() => {
    if (workOrder.stateWorkOrder == StateWorkOrder.Finished) return;
    if (workOrder.workOrderType == WorkOrderType.Preventive) {
      const allInspectionPointsChecked =
        workOrder.workOrderInspectionPoint !== undefined
          ? workOrder.workOrderInspectionPoint.every(
              inspectionPoint => inspectionPoint.check
            )
          : false;
      setIsPassInspectionPoints(allInspectionPointsChecked ?? false);
    }
  }, []);

  const hasDefaultReason =
    workOrder?.downtimeReason != undefined &&
    workOrder.downtimeReason.assetId == '';

  async function handleChangeStateWorkOrder(state: StateWorkOrder) {
    toggleLoading(
      workOrderId +
        (state === StateWorkOrder.PendingToValidate ||
        state === StateWorkOrder.Closed
          ? '_Validate'
          : '_Sign')
    );

    if (!operatorLogged) {
      alert('Has de tenir un operari fitxat per fer aquesta acció');
      toggleLoading(
        workOrderId +
          (state === StateWorkOrder.PendingToValidate ||
          state === StateWorkOrder.Closed
            ? '_Validate'
            : '_Sign')
      );
      return;
    }
    if (hasDefaultReason) {
      alert("Tens el motiu per defecte, no pots canviar l'estat");
      toggleLoading(
        workOrderId +
          (state === StateWorkOrder.PendingToValidate ||
          state === StateWorkOrder.Closed
            ? '_Validate'
            : '_Sign')
      );
      return;
    }
    if (workOrder.stateWorkOrder == state) {
      toggleLoading(
        workOrderId +
          (state === StateWorkOrder.PendingToValidate ||
          state === StateWorkOrder.Closed
            ? '_Validate'
            : '_Sign')
      );
      return;
    }

    const update: UpdateStateWorkOrder[] = [
      {
        workOrderId: workOrder.id,
        state: state,
        operatorId: operatorLogged?.idOperatorLogged,
        userId: loginUser?.agentId,
      },
    ];
    await workOrderService.updateStateWorkOrder(update).then(response => {
      if (response) {
        workOrder.stateWorkOrder = state;
        onChangeStateWorkOrder && onChangeStateWorkOrder();
      } else {
        //     setErrorMessage("Error actualitzant el treball");
      }
    });
    toggleLoading(
      workOrderId +
        (state === StateWorkOrder.PendingToValidate ||
        state === StateWorkOrder.Closed
          ? '_Validate'
          : '_Sign')
    );
  }

  function handleSparePartsModal() {
    if (!operatorLogged) {
      alert('Has de tenir un operari fitxat per fer aquesta acció');
      return;
    }
    setShowModal(true);
  }

  useEffect(() => {
    if (!isModalOpen) {
      setShowModal(false);
    }
  }, [isModalOpen]);

  const validStates = [
    StateWorkOrder.Waiting,
    StateWorkOrder.OnGoing,
    StateWorkOrder.Paused,
    StateWorkOrder.Open,
  ];

  const classNameOnGoing = `${
    validStates.includes(workOrder.stateWorkOrder)
      ? `${
          workOrder.stateWorkOrder == StateWorkOrder.OnGoing
            ? 'bg-gray-500'
            : 'bg-okron-onGoing '
        } hover:${
          workOrder.stateWorkOrder == StateWorkOrder.OnGoing
            ? 'bg-okron-hoverWaiting'
            : 'bg-okron-hoverOnGoing'
        }`
      : 'bg-gray-200 pointer-events-none'
  } text-white  rounded flex gap-1 w-full justify-center items-center `;

  const classNameValidate = `${
    validStates.includes(workOrder.stateWorkOrder)
      ? `${
          workOrder.stateWorkOrder == StateWorkOrder.PendingToValidate
            ? 'bg-emerald-700'
            : 'bg-okron-finished '
        } hover:${
          workOrder.stateWorkOrder == StateWorkOrder.PendingToValidate
            ? 'bg-emerald-900 pointer-events-none'
            : 'bg-okron-hoverPendingToValidate'
        }`
      : 'bg-gray-200 pointer-events-none'
  } text-white  rounded flex gap-1 w-full justify-center items-center `;

  const classNameSpareParts = `${
    validStates.includes(workOrder.stateWorkOrder)
      ? `${
          workOrder.stateWorkOrder == StateWorkOrder.PendingToValidate
            ? 'bg-emerald-700'
            : 'bg-gray-500 '
        } hover:${
          workOrder.stateWorkOrder == StateWorkOrder.PendingToValidate
            ? 'bg-emerald-900 pointer-events-none'
            : 'bg-gray-700'
        }`
      : 'bg-gray-200 pointer-events-none'
  } text-white  rounded flex gap-1 w-full justify-center items-center `;

  const classNamePreventive = `
    ${
      validStates.includes(workOrder.stateWorkOrder)
        ? `${isPassInspectionPoints ? 'bg-lime-700' : 'bg-red-500'} hover:${
            isPassInspectionPoints ? 'cursor-not-allowed' : 'bg-red-700'
          }`
        : 'bg-gray-200 pointer-events-none'
    } text-white rounded p-2 flex gap-2 justify-center align-middle w-full`;

  if (enableActions)
    return (
      <div className="flex w-full gap-2">
        {showModal && (
          <SparePartsModal workOrder={workOrder} isFinished={false} />
        )}
        {loginUser?.userType == UserType.Maintenance &&
          workOrder.workOrderType != WorkOrderType.Ticket && (
            <Button
              data-tooltip-id="my-tooltip-1"
              type="none"
              size="md"
              onClick={() => {
                workOrder.stateWorkOrder == StateWorkOrder.OnGoing
                  ? handleChangeStateWorkOrder(StateWorkOrder.Paused)
                  : handleChangeStateWorkOrder(StateWorkOrder.OnGoing);
              }}
              className={classNameOnGoing}
            >
              {isLoading[workOrderId + '_Sign'] ? (
                <SvgSpinner className="text-white" />
              ) : workOrder.stateWorkOrder == StateWorkOrder.OnGoing ? (
                <SvgPause className="text-white" />
              ) : (
                <SvgStart />
              )}
            </Button>
          )}
        {((loginUser?.userType == UserType.Maintenance &&
          workOrder.workOrderType != WorkOrderType.Ticket) ||
          loginUser?.userType == UserType.Production) && (
          <Button
            data-tooltip-id="my-tooltip-2"
            type="none"
            className={`${classNameValidate}`}
            onClick={() => {
              if (
                (!validStates.includes(workOrder.stateWorkOrder) &&
                  workOrder.workOrderType != WorkOrderType.Ticket) ||
                isLoading[workOrderId + '_Validate']
              )
                return;

              if (
                workOrder.stateWorkOrder != StateWorkOrder.PendingToValidate
              ) {
                handleChangeStateWorkOrder(
                  loginUser?.userType == UserType.Maintenance
                    ? StateWorkOrder.PendingToValidate
                    : StateWorkOrder.Closed
                );
              }
            }}
          >
            {isLoading[workOrderId + '_Validate'] ? (
              <SvgSpinner />
            ) : (
              <SvgCheck />
            )}
          </Button>
        )}

        {workOrder.workOrderType == WorkOrderType.Corrective &&
          loginUser?.userType == UserType.Maintenance && (
            <Button
              data-tooltip-id="my-tooltip-3"
              onClick={() => {
                handleSparePartsModal();
              }}
              type="none"
              className={`${classNameSpareParts}`}
            >
              {isLoading[workOrderId + '_SpareParts'] ? (
                <SvgSpinner />
              ) : (
                <SvgSparePart />
              )}
            </Button>
          )}
        {workOrder.workOrderType == WorkOrderType.Preventive &&
          loginUser?.userType == UserType.Maintenance && (
            <Button
              data-tooltip-id="InspectionPoints"
              onClick={() => {
                !isPassInspectionPoints && handleInspectionPoints(workOrderId);
              }}
              type="none"
              customStyles={`${
                isPassInspectionPoints ? 'cursor-not-allowed' : ''
              }`}
              className={`${classNamePreventive} text-white rounded p-2 flex gap-2 justify-center align-middle w-full`}
            >
              {isLoading[workOrderId + '_InspectionPoints'] ? (
                <SvgSpinner />
              ) : (
                <SvgInspectionPoints />
              )}
            </Button>
          )}

        <Button
          data-tooltip-id="edit"
          type="none"
          onClick={() => {
            toggleLoading(workOrderId + '_Detail');
          }}
          href={`${Routes.workOrders + '/' + workOrder.id}`}
          className={`bg-okron-btDetail hover:bg-okron-btnDetailHover rounded flex text-center p-2 w-full justify-center align-middle text-white`}
          customStyles="justify-center align-middle"
        >
          {isLoading[workOrderId + '_Detail'] ? <SvgSpinner /> : <SvgDetail />}
        </Button>
        <WorkOrderOperationsInTableToolTips
          pause={workOrder.stateWorkOrder == StateWorkOrder.Paused}
        />
      </div>
    );
  else
    return (
      <Button
        data-tooltip-id="my-tooltip-4"
        type="none"
        onClick={() => {
          toggleLoading(workOrderId + '_Detail');
        }}
        href={`${Routes.workOrders + '/' + workOrder.id}`}
        className={`bg-okron-btDetail hover:bg-okron-btnDetailHover rounded flex text-center p-2 w-full justify-center align-middle text-white`}
        customStyles="justify-center align-middle"
      >
        {isLoading[workOrderId + '_Detail'] ? <SvgSpinner /> : <SvgDetail />}
      </Button>
    );
}

interface SparePartsModalProps {
  workOrder: WorkOrder;
  isFinished: boolean;
}

export const SparePartsModal = ({
  workOrder,
  isFinished,
}: SparePartsModalProps) => {
  const { setIsModalOpen } = useGlobalStore(state => state);

  const { spareParts, sparePartsError } = useSparePartsHook(true);

  const [selectedSpareParts, setSelectedSpareParts] = useState<
    WorkOrderSparePart[]
  >([]);

  useEffect(() => {
    if (workOrder.workOrderSpareParts) {
      setSelectedSpareParts(workOrder.workOrderSpareParts);
    }
  }, []);

  useEffect(() => {
    workOrder.workOrderSpareParts?.forEach(x => {
      setSelectedSpareParts(prevSelected => [...prevSelected, x]);
    });
  }, [selectedSpareParts]);

  if (sparePartsError) {
    return <div>Error loading spare parts: {sparePartsError.message}</div>;
  }

  return (
    <>
      <Modal
        isVisible={true}
        type="center"
        height="h-auto"
        width="w-full"
        className="max-w-md mx-auto"
      >
        <div className="bg-blue-950 p-4 rounded-lg shadow-md w-full">
          <div className="relative bg-white">
            <div className="absolute p-2 top-0 right-0 justify-end hover:cursor-pointer">
              <SvgClose
                onClick={() => {
                  setIsModalOpen(false);
                }}
              />
            </div>
            {spareParts != undefined && spareParts.length > 0 ? (
              <ChooseSpareParts
                availableSpareParts={spareParts}
                selectedSpareParts={selectedSpareParts!}
                setSelectedSpareParts={setSelectedSpareParts}
                WordOrderId={workOrder.id}
                isFinished={isFinished}
              />
            ) : (
              <SvgSpinner />
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};
