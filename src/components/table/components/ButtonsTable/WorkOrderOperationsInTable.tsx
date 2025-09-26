import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { workOrderService } from 'app/services/workOrderService';
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

// ✅ Singleton para el servicio (fuera del componente)
const SparePartsModalContent = React.memo(
  ({
    workOrder,
    isFinished,
  }: {
    workOrder: WorkOrder;
    isFinished: boolean;
  }) => {
    const { setIsModalOpen } = useGlobalStore();
    const { spareParts, sparePartsError } = useSparePartsHook(true);
    const [selectedSpareParts, setSelectedSpareParts] = useState<
      WorkOrderSparePart[]
    >(workOrder.workOrderSpareParts || []);

    if (sparePartsError) {
      return <div>Error loading spare parts: {sparePartsError.message}</div>;
    }

    return (
      <div className="bg-blue-950 p-1 rounded-lg shadow-md w-full">
        <div className="relative bg-white">
          <div className="absolute p-2 top-0 right-0 justify-end hover:cursor-pointer">
            <SvgClose onClick={() => setIsModalOpen(false)} />
          </div>
          {spareParts && spareParts.length > 0 ? (
            <ChooseSpareParts
              selectedSpareParts={selectedSpareParts}
              setSelectedSpareParts={setSelectedSpareParts}
              workOrder={workOrder}
              isFinished={isFinished}
            />
          ) : (
            <SvgSpinner />
          )}
        </div>
      </div>
    );
  }
);

SparePartsModalContent.displayName = 'SparePartsModalContent';

const WorkOrderOperationsInTable = React.memo(
  ({
    workOrderId,
    workOrder,
    onChangeStateWorkOrder,
    enableActions = true,
  }: WorkOrderOperationsInTableProps) => {
    const Routes = useRoutes();
    const { operatorLogged, loginUser } = useSessionStore();
    const { isModalOpen } = useGlobalStore();

    const [isPassInspectionPoints, setIsPassInspectionPoints] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const hasDefaultReason = useMemo(
      () =>
        workOrder?.downtimeReason != undefined &&
        workOrder.downtimeReason.assetId === '',
      [workOrder?.downtimeReason]
    );

    const validStates = useMemo(
      () => [
        StateWorkOrder.Waiting,
        StateWorkOrder.OnGoing,
        StateWorkOrder.Paused,
        StateWorkOrder.Open,
      ],
      []
    );

    // ✅ Efecto optimizado para inspection points
    useEffect(() => {
      if (workOrder.stateWorkOrder === StateWorkOrder.Finished) return;

      if (
        workOrder.workOrderType === WorkOrderType.Preventive &&
        workOrder.workOrderInspectionPoint
      ) {
        const allChecked = workOrder.workOrderInspectionPoint.every(
          inspectionPoint => inspectionPoint.check
        );
        setIsPassInspectionPoints(allChecked);
      }
    }, [
      workOrder.stateWorkOrder,
      workOrder.workOrderType,
      workOrder.workOrderInspectionPoint,
    ]);

    // ✅ Handlers memoizados
    const handleInspectionPoints = useCallback(async () => {
      if (!operatorLogged) {
        alert('Has de tenir un operari fitxat per fer aquesta acció');
        return;
      }

      setIsLoading('InspectionPoints');
      try {
        await checkAllInspectionPoints(
          workOrder.workOrderInspectionPoint!,
          workOrderId
        );
        setIsPassInspectionPoints(prev => !prev);
      } finally {
        setIsLoading(null);
      }
    }, [operatorLogged, workOrder.workOrderInspectionPoint, workOrderId]);

    const handleChangeStateWorkOrder = useCallback(
      async (state: StateWorkOrder) => {
        const loadingKey =
          state === StateWorkOrder.PendingToValidate ||
          state === StateWorkOrder.Closed
            ? 'Validate'
            : 'Sign';

        setIsLoading(loadingKey);

        try {
          if (!operatorLogged) {
            alert('Has de tenir un operari fitxat per fer aquesta acció');
            return;
          }

          if (hasDefaultReason) {
            alert("Tens el motiu per defecte, no pots canviar l'estat");
            return;
          }

          if (workOrder.stateWorkOrder === state) {
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

          await workOrderService.updateStateWorkOrder(update);
          workOrder.stateWorkOrder = state;
          onChangeStateWorkOrder?.();
        } finally {
          setIsLoading(null);
        }
      },
      [
        operatorLogged,
        hasDefaultReason,
        workOrder,
        loginUser?.agentId,
        onChangeStateWorkOrder,
      ]
    );

    const handleSparePartsModal = useCallback(() => {
      if (!operatorLogged) {
        alert('Has de tenir un operari fitxat per fer aquesta acció');
        return;
      }
      setShowModal(true);
    }, [operatorLogged]);

    useEffect(() => {
      if (!isModalOpen) {
        setShowModal(false);
      }
    }, [isModalOpen]);

    // ✅ Classes memoizadas
    const classNameOnGoing = useMemo(
      () =>
        validStates.includes(workOrder.stateWorkOrder)
          ? `${
              workOrder.stateWorkOrder === StateWorkOrder.OnGoing
                ? 'bg-gray-500'
                : 'bg-okron-onGoing'
            } hover:${
              workOrder.stateWorkOrder === StateWorkOrder.OnGoing
                ? 'bg-okron-hoverWaiting'
                : 'bg-okron-hoverOnGoing'
            }`
          : 'bg-gray-200 pointer-events-none',
      [workOrder.stateWorkOrder, validStates]
    );

    const classNameValidate = useMemo(
      () =>
        validStates.includes(workOrder.stateWorkOrder)
          ? `${
              workOrder.stateWorkOrder === StateWorkOrder.PendingToValidate
                ? 'bg-emerald-700'
                : 'bg-okron-finished'
            } hover:${
              workOrder.stateWorkOrder === StateWorkOrder.PendingToValidate
                ? 'bg-emerald-900 pointer-events-none'
                : 'bg-okron-hoverPendingToValidate'
            }`
          : 'bg-gray-200 pointer-events-none',
      [workOrder.stateWorkOrder, validStates]
    );

    const classNameSpareParts = useMemo(
      () =>
        validStates.includes(workOrder.stateWorkOrder)
          ? `${
              workOrder.stateWorkOrder === StateWorkOrder.PendingToValidate
                ? 'bg-emerald-700'
                : 'bg-gray-500'
            } hover:${
              workOrder.stateWorkOrder === StateWorkOrder.PendingToValidate
                ? 'bg-emerald-900 pointer-events-none'
                : 'bg-gray-700'
            }`
          : 'bg-gray-200 pointer-events-none',
      [workOrder.stateWorkOrder, validStates]
    );

    const classNamePreventive = useMemo(
      () =>
        validStates.includes(workOrder.stateWorkOrder)
          ? `${isPassInspectionPoints ? 'bg-lime-700' : 'bg-red-500'} hover:${
              isPassInspectionPoints ? 'cursor-not-allowed' : 'bg-red-700'
            }`
          : 'bg-gray-200 pointer-events-none',
      [workOrder.stateWorkOrder, validStates, isPassInspectionPoints]
    );

    if (!enableActions) {
      return (
        <Button
          type="none"
          href={`${Routes.workOrders}/${workOrder.id}`}
          className="bg-okron-btDetail hover:bg-okron-btnDetailHover rounded flex text-center p-2 w-full justify-center align-middle text-white"
          customStyles="justify-center align-middle"
        >
          {isLoading === 'Detail' ? <SvgSpinner /> : <SvgDetail />}
        </Button>
      );
    }

    return (
      <div className="flex w-full gap-2">
        {showModal && (
          <Modal
            isVisible={true}
            type="center"
            height="h-auto"
            width="w-full"
            className="max-w-md mx-auto"
          >
            <SparePartsModalContent workOrder={workOrder} isFinished={false} />
          </Modal>
        )}

        {loginUser?.userType === UserType.Maintenance &&
          workOrder.workOrderType !== WorkOrderType.Ticket && (
            <Button
              type="none"
              size="md"
              onClick={() =>
                handleChangeStateWorkOrder(
                  workOrder.stateWorkOrder === StateWorkOrder.OnGoing
                    ? StateWorkOrder.Paused
                    : StateWorkOrder.OnGoing
                )
              }
              className={classNameOnGoing}
            >
              {isLoading === 'Sign' ? (
                <SvgSpinner className="text-white" />
              ) : workOrder.stateWorkOrder === StateWorkOrder.OnGoing ? (
                <SvgPause className="text-white" />
              ) : (
                <SvgStart />
              )}
            </Button>
          )}

        {(loginUser?.userType === UserType.Maintenance &&
          workOrder.workOrderType !== WorkOrderType.Ticket) ||
          (loginUser?.userType === UserType.Production && (
            <Button
              type="none"
              className={classNameValidate}
              onClick={() => {
                if (
                  workOrder.stateWorkOrder !== StateWorkOrder.PendingToValidate
                ) {
                  handleChangeStateWorkOrder(
                    loginUser?.userType === UserType.Maintenance
                      ? StateWorkOrder.PendingToValidate
                      : StateWorkOrder.Closed
                  );
                }
              }}
            >
              {isLoading === 'Validate' ? <SvgSpinner /> : <SvgCheck />}
            </Button>
          ))}

        {workOrder.workOrderType === WorkOrderType.Corrective &&
          loginUser?.userType === UserType.Maintenance && (
            <Button
              type="none"
              onClick={handleSparePartsModal}
              className={classNameSpareParts}
            >
              {isLoading === 'SpareParts' ? <SvgSpinner /> : <SvgSparePart />}
            </Button>
          )}

        {workOrder.workOrderType === WorkOrderType.Preventive &&
          loginUser?.userType === UserType.Maintenance && (
            <Button
              type="none"
              onClick={
                !isPassInspectionPoints ? handleInspectionPoints : undefined
              }
              className={classNamePreventive}
              customStyles={isPassInspectionPoints ? 'cursor-not-allowed' : ''}
            >
              {isLoading === 'InspectionPoints' ? (
                <SvgSpinner />
              ) : (
                <SvgInspectionPoints />
              )}
            </Button>
          )}

        <Button
          type="none"
          href={`${Routes.workOrders}/${workOrder.id}`}
          className="bg-okron-btDetail hover:bg-okron-btnDetailHover rounded flex text-center p-2 w-full justify-center align-middle text-white"
          customStyles="justify-center align-middle"
          onClick={() => setIsLoading('Detail')}
        >
          {isLoading === 'Detail' ? <SvgSpinner /> : <SvgDetail />}
        </Button>

        <WorkOrderOperationsInTableToolTips
          pause={workOrder.stateWorkOrder === StateWorkOrder.Paused}
        />
      </div>
    );
  }
);

WorkOrderOperationsInTable.displayName = 'WorkOrderOperationsInTable';

export default WorkOrderOperationsInTable;
