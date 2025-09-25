import { Asset } from './Asset';
import { BaseModel } from './BaseModel';
import { CustomerAddress } from './Customer';
import InspectionPoint from './inspectionPoint';
import Machine from './machine';
import Operator from './Operator';
import { Preventive } from './Preventive';
import { Downtimes, DowntimesReasons } from './Production/Downtimes';
import SparePart from './SparePart';
import { UserType } from './User';

export interface WorkOrder extends BaseModel {
  id: string;
  code: string;
  description: string;
  creationTime: Date;
  startTime: Date;
  endTime: Date;
  stateWorkOrder: StateWorkOrder;
  workOrderType: WorkOrderType;
  machineId?: string;
  machine?: Machine;
  workOrderInspectionPoint?: WorkOrderInspectionPoint[];
  workOrderOperatorTimes?: WorkOrderOperatorTimes[];
  operator?: Operator[];
  operatorId?: string[];
  workOrderSpareParts?: WorkOrderSparePart[];
  workOrderComments?: WorkOrderComment[];
  asset?: Asset;
  workOrderEvents?: WorkOrderEvents[];
  preventive?: Preventive;
  plannedDuration: string;
  operatorsNames?: string;
  originWorkOrder?: OriginWorkOrder;
  downtimeReason?: DowntimesReasons;
  downtimes?: Downtimes[];
  originalWorkOrderId?: string;
  workOrderCreatedId?: string;
  visibleReport?: boolean;
  customerWorkOrder?: CustomerWorkOrder;
  refCustomerId?: string;
}

export default WorkOrder;

export interface WorkOrderSparePart {
  creationDate?: Date;
  id: string;
  quantity: number;
  sparePart: SparePart;
  operator?: Operator;
  warehouseId: string;
  warehouse: string;
  warehouseName: string;
}

export enum StateWorkOrder {
  Waiting,
  OnGoing,
  Paused,
  Finished,
  Requested,
  PendingToValidate,
  Open,
  Closed,
  NotFinished,
  Invoiced,
}

export enum OriginWorkOrder {
  Maintenance,
  Production,
}

export interface WorkOrderInspectionPoint {
  id: string;
  check?: boolean;
  inspectionPoint: InspectionPoint;
}

export interface WorkOrderOperatorTimes {
  id?: string;
  startTime: Date;
  endTime?: Date;
  totalTime?: string;
  operator: Operator;
  type?: WorkOrderOperatorTimeType;
}

export enum WorkOrderOperatorTimeType {
  Time,
  Travel,
}

export interface UpdateWorkOrderRequest extends CreateWorkOrderRequest {
  downtimeReason?: DowntimesReasons;
  startTime?: Date;
  visibleReport?: boolean;
  refCustomerId?: string;
  creationTime?: Date;
}

export interface CreateWorkOrderRequest {
  id?: string;
  code?: string;
  description: string;
  initialDateTime?: Date;
  stateWorkOrder: StateWorkOrder;
  workOrderType?: WorkOrderType;
  machineId?: string;
  assetId?: string;
  operatorId?: string[];
  inspectionPointId?: string[];
  sparePartId?: string[];
  userId?: string;
  operatorCreatorId: string;
  originWorkOrder: UserType;
  downtimeReasonId?: string;
  originalWorkOrderId?: string;
  originalWorkOrderCode?: string;
  workOrderCreatedId?: string;
}

export interface AddWorkOrderOperatorTimes {
  WorkOrderId: string;
  startTime: Date;
  operatorId: string;
  workOrderOperatorTimesId?: string;
}

export interface FinishWorkOrderOperatorTimes {
  WorkOrderId: string;
  finishTime: Date;
  operatorId: string;
}

export interface UpdateWorkOrderOperatorTimes {
  workOrderId: string;
  startTime: Date;
  endTime?: Date;
  workOrderOperatorTimesId: string;
  type: WorkOrderOperatorTimeType;
}

export interface DeleteWorkOrderOperatorTimes {
  workOrderId: string;
  workOrderOperatorTimesId: string;
}

export interface SearchWorkOrderFilters {
  machineId?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  operatorId?: string;
  assetId?: string;
  stateWorkOrder?: StateWorkOrder[];
  userType: UserType;
  originWorkOrder: OriginWorkOrder;
  showNextWO?: boolean;
}

export enum WorkOrderType {
  Corrective = 0,
  Preventive = 1,
  Predicitve = 2,
  Ticket = 3,
}

export interface SaveInspectionResultPointRequest {
  WorkOrderId: string;
  WorkOrderInspectionPointId: string;
  resultInspectionPoint: ResultInspectionPoint;
}

export enum ResultInspectionPoint {
  Pending,
  Ok,
  NOk,
}

export interface WorkOrderComment {
  id?: string;
  creationDate: string;
  comment: string;
  operator: Operator;
  type: WorkOrderCommentType;
  urls: string[];
}

export enum WorkOrderCommentType {
  Internal,
  External,
  NoFinished,
}

export interface AddCommentToWorkOrderRequest {
  comment: string;
  operatorId: string;
  workOrderId: string;
  type: WorkOrderCommentType;
}

export interface UpdateStateWorkOrder {
  workOrderId: string;
  state: StateWorkOrder;
  operatorId?: string;
  userId?: string;
}

export interface WorkOrderEvents {
  id: string;
  date: string;
  endDate?: string;
  workOrderEventType: WorkOrderEventType;
  operator: Operator;
}

export enum WorkOrderEventType {
  Requested,
  Waiting,
  Started,
  Paused,
  PendingToValidate,
  Finished,
  Created,
}

export interface WorkOrdersFilters {
  workOrderType: WorkOrderType[];
  workOrderState: StateWorkOrder[];
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  searchTerm: string;
  assetId: string;
  refCustomerId: string;
  customerName: string;
}

export interface CustomerWorkOrder {
  customerId: string;
  customerName: string;
  customerNif: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: CustomerAddress;
  customerInstallaionId: string;
  customerInstallationCode: string;
  customerInstallationAddress: CustomerAddress;
}
