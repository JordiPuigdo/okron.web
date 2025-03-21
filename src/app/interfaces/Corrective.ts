import { StateWorkOrder,WorkOrderType } from "./workOrder";

export interface Corrective {
    id?: string
    code : string;
    description : string,
    machineId : string,
    stateWorkOrder: StateWorkOrder;
    workOrderType : WorkOrderType;
    startTime : Date,
    endTime : Date,
    hours : number,
    counter : number,
    operators : string[],
}