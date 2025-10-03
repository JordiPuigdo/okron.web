import { UserType } from 'app/interfaces/User';
import { StateWorkOrder } from 'app/interfaces/workOrder';

export function getStatesForProduction() {
  return [StateWorkOrder.Open, StateWorkOrder.Closed];
}

export function getStatesForCRM() {
  return [
    StateWorkOrder.Finished,
    StateWorkOrder.NotFinished,
    StateWorkOrder.Waiting,
  ];
}

export function getStatesForMaintenance() {
  return [
    StateWorkOrder.Waiting,
    StateWorkOrder.Paused,
    StateWorkOrder.OnGoing,
    StateWorkOrder.PendingToValidate,
    StateWorkOrder.Finished,
    StateWorkOrder.Open,
  ];
}

export function getValidStates(userType: UserType) {
  if (userType === UserType.Maintenance) {
    return getStatesForMaintenance();
  } else if (userType === UserType.Production) {
    return getStatesForProduction();
  } else {
    return getStatesForCRM();
  }
}
