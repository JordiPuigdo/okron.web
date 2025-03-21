import { useState } from 'react';
import {
  SvgCheck,
  SvgPause,
  SvgPending,
  SvgSpinner,
  SvgStart,
} from 'app/icons/icons';
import { UserPermission, UserType } from 'app/interfaces/User';
import {
  OriginWorkOrder,
  StateWorkOrder,
  UpdateStateWorkOrder,
  WorkOrder,
  WorkOrderType,
} from 'app/interfaces/workOrder';
import WorkOrderService from 'app/services/workOrderService';
import { useSessionStore } from 'app/stores/globalStore';
import { Button } from 'designSystem/Button/Buttons';

interface WorkOrderButtonsProps {
  workOrder: WorkOrder;
  handleReload: () => void;
}

const WorkOrderButtons: React.FC<WorkOrderButtonsProps> = ({
  workOrder,
  handleReload,
}: WorkOrderButtonsProps) => {
  const [errorMessage, setErrorMessage] = useState('');
  const workOrderService = new WorkOrderService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const { loginUser, operatorLogged } = useSessionStore(state => state);

  const toggleLoading = (id: StateWorkOrder) => {
    setIsLoading(prevLoading => ({
      ...prevLoading,
      [id]: !prevLoading[id],
    }));
  };

  function handleChangeStateWorkOrder(state: StateWorkOrder) {
    if (!operatorLogged) {
      alert('Has de tenir un operari fitxat per fer aquesta acció');
      return;
    }

    if (
      hasDefaultReason &&
      (state == StateWorkOrder.PendingToValidate ||
        state == StateWorkOrder.Closed)
    ) {
      alert("Tens el motiu per defecte, no pots canviar l'estat");
      return;
    }
    if (workOrder.stateWorkOrder == state) {
      return;
    }
    toggleLoading(state);
    const update: UpdateStateWorkOrder[] = [
      {
        workOrderId: workOrder.id,
        state: state,
        operatorId: operatorLogged?.idOperatorLogged,
        userId: loginUser?.agentId,
      },
    ];
    workOrderService.updateStateWorkOrder(update).then(response => {
      if (response) {
        handleReload();
        toggleLoading(state);
      } else {
        setErrorMessage('Error actualitzant el treball');
        toggleLoading(state);
      }
    });
  }

  const hasDefaultReason =
    workOrder?.downtimeReason != undefined &&
    workOrder.downtimeReason.assetId == '';

  return (
    <div className="flex gap-2">
      {workOrder.stateWorkOrder != StateWorkOrder.Finished && (
        <>
          {loginUser?.permission == UserPermission.Administrator &&
            loginUser?.userType == UserType.Maintenance &&
            workOrder.originWorkOrder != OriginWorkOrder.Production && (
              <Button
                disabled={workOrder.stateWorkOrder == StateWorkOrder.Waiting}
                onClick={() =>
                  handleChangeStateWorkOrder(StateWorkOrder.Waiting)
                }
                type="none"
                customStyles="flex justify-center items-center bg-okron-waiting h-24 w-24 rounded-xl shadow-md text-white font-semibold hover:bg-okron-hoverPending w-full"
                className="w-full"
              >
                {isLoading[StateWorkOrder.Waiting] ? (
                  <SvgSpinner className="text-white" />
                ) : (
                  <SvgPending />
                )}
              </Button>
            )}
          {loginUser?.userType == UserType.Maintenance &&
            workOrder.originWorkOrder != OriginWorkOrder.Production && (
              <Button
                disabled={
                  workOrder.stateWorkOrder == StateWorkOrder.OnGoing ||
                  workOrder.stateWorkOrder ==
                    (StateWorkOrder.Finished as StateWorkOrder) ||
                  workOrder.stateWorkOrder == StateWorkOrder.PendingToValidate
                }
                onClick={() =>
                  handleChangeStateWorkOrder(StateWorkOrder.OnGoing)
                }
                type="none"
                className="w-full"
                customStyles="flex justify-center items-center bg-okron-onGoing h-24 w-24 rounded-xl shadow-md text-white font-semibold hover:bg-okron-hoverOnGoing w-full"
              >
                {isLoading[StateWorkOrder.OnGoing] ? (
                  <SvgSpinner className="text-white" />
                ) : (
                  <SvgStart />
                )}
              </Button>
            )}
          {loginUser?.userType == UserType.Maintenance &&
            workOrder.originWorkOrder != OriginWorkOrder.Production && (
              <Button
                disabled={
                  workOrder.stateWorkOrder == StateWorkOrder.Paused ||
                  workOrder.stateWorkOrder ==
                    (StateWorkOrder.Finished as StateWorkOrder) ||
                  workOrder.stateWorkOrder == StateWorkOrder.PendingToValidate
                }
                onClick={() =>
                  handleChangeStateWorkOrder(StateWorkOrder.Paused)
                }
                type="none"
                className="w-full"
                customStyles="flex justify-center items-center bg-gray-500 h-24 w-24 rounded-xl shadow-md text-white font-semibold hover:bg-okron-hoverWaiting w-full"
              >
                {isLoading[StateWorkOrder.Paused] ? (
                  <SvgSpinner className="text-white" />
                ) : (
                  <SvgPause />
                )}
              </Button>
            )}
          {loginUser?.userType == UserType.Maintenance &&
            workOrder.originWorkOrder != OriginWorkOrder.Production && (
              <Button
                disabled={
                  workOrder.stateWorkOrder == StateWorkOrder.PendingToValidate
                }
                onClick={() =>
                  handleChangeStateWorkOrder(StateWorkOrder.PendingToValidate)
                }
                type="none"
                className="w-full"
                customStyles="flex justify-center items-center bg-okron-finished h-24 w-24 rounded-xl shadow-md text-white font-semibold hover:bg-okron-hoverPendingToValidate w-full"
              >
                {isLoading[StateWorkOrder.PendingToValidate] ? (
                  <SvgSpinner className="text-white" />
                ) : (
                  <SvgCheck />
                )}
              </Button>
            )}
          {loginUser?.userType == UserType.Production &&
            workOrder.workOrderType == WorkOrderType.Ticket && (
              <Button
                disabled={workOrder.stateWorkOrder == StateWorkOrder.Closed}
                onClick={() =>
                  handleChangeStateWorkOrder(StateWorkOrder.Closed)
                }
                type="none"
                className="w-full"
                customStyles="flex justify-center items-center bg-okron-finished h-24 w-24 rounded-xl shadow-md text-white font-semibold hover:bg-okron-hoverPendingToValidate w-full"
              >
                {isLoading[StateWorkOrder.Closed] ? (
                  <SvgSpinner className="text-white" />
                ) : (
                  <SvgCheck />
                )}
              </Button>
            )}
        </>
      )}
      {(workOrder.stateWorkOrder == StateWorkOrder.Finished ||
        workOrder.stateWorkOrder == StateWorkOrder.Closed) &&
        loginUser?.permission == UserPermission.Administrator && (
          <Button
            onClick={() =>
              handleChangeStateWorkOrder(
                loginUser.userType == UserType.Maintenance
                  ? StateWorkOrder.Waiting
                  : StateWorkOrder.Open
              )
            }
            type="none"
            customStyles="flex justify-center items-center bg-orange-500 h-24 w-24 rounded-xl shadow-md text-white font-semibold hover:bg-orange-600 "
          >
            {isLoading[StateWorkOrder.Waiting] ? (
              <SvgSpinner className="text-white" />
            ) : (
              'Reobrir'
            )}
          </Button>
        )}
    </div>
  );
};

export default WorkOrderButtons;
