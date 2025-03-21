import { AddWorkOrderOperatorTimes, FinishWorkOrderOperatorTimes, StateWorkOrder, WorkOrderOperatorTimes } from "app/interfaces/workOrder";
import WorkOrderService from "app/services/workOrderService";

const workOrderService = new WorkOrderService(process.env.NEXT_PUBLIC_API_BASE_URL!);

async function clockInOperator(workOrderId: string, operatorId: string): Promise<void> {
  const startTime = new Date();
  const newOperationData: AddWorkOrderOperatorTimes = {
    WorkOrderId: workOrderId,
    operatorId: operatorId,
    startTime: startTime,
  };

  try {
    await workOrderService.addWorkOrderOperatorTimes(newOperationData).then((response) => {
      if (response) {
        //return response;
      }
    }).catch((error) => {
      console.log('Error starting new operation:', error);
      throw error;
    });
  } catch (error) {
    console.log('Error starting new operation:', error);
    throw error;
  }
}

async function clockOutOperator( finishWorkOrderOperatorTimes : FinishWorkOrderOperatorTimes) {

  try {
      await workOrderService.finishWorkOrderOperatorTimes(finishWorkOrderOperatorTimes);
    } catch (error) {
      console.log('Error finishing operation:', error);
      throw error;
    }

}

export async function startOrFinalizeTimeOperation(
  workOrderOperatorTimes: WorkOrderOperatorTimes[],
  workOrderId: string,
  operatorId: string,
  stateWorkOrder?: StateWorkOrder
): Promise<void> {
  
  const finishTime = new Date();
  const lastOperation = workOrderOperatorTimes.find(
    (time) => time.operator.id === operatorId && (time.endTime === undefined || time.endTime === null)
  );

  if(stateWorkOrder === StateWorkOrder.OnGoing) {
    await clockInOperator(workOrderId, operatorId);
    return;
  }
  
  if (stateWorkOrder === StateWorkOrder.Paused || stateWorkOrder === StateWorkOrder.Finished || 
      stateWorkOrder === StateWorkOrder.PendingToValidate || stateWorkOrder === StateWorkOrder.Waiting) {
    

    if (lastOperation) {
      const finishData: FinishWorkOrderOperatorTimes = {
        WorkOrderId: workOrderId,
        operatorId: operatorId,
        finishTime: finishTime,
      };
      await clockOutOperator(finishData);
    }
    return;
  }

  if (lastOperation) {
      const finishData: FinishWorkOrderOperatorTimes = {
        WorkOrderId: workOrderId,
        operatorId: operatorId,
        finishTime: finishTime,
      };
      await clockOutOperator(finishData);
  } else{
    clockInOperator(workOrderId, operatorId);
  }

  

}

 
