import { Asset } from './Asset';
import InspectionPoint from './inspectionPoint';
import Machine from './machine';
import Operator from './Operator';
import WorkOrder from './workOrder';

export interface Preventive {
  id: string;
  code: string;
  description: string;
  machine: Machine;
  startExecution: Date;
  lastExecution: Date;
  nextExecutionDate: Date;
  hours?: number;
  days: number;
  counter: number;
  inspectionPoints: InspectionPoint[];
  operators: Operator[];
  assetId?: string[];
  asset: Asset;
  active: boolean;
  plannedDuration: string;
  spareParts: SparePartPreventive[];
}

export interface SparePartPreventive {
  sparePartId: string;
  sparePartCode: string;
  sparePartDescription: string;
}

export interface CreatePreventiveRequest {
  code: string;
  description: string;
  machineId?: string[];
  startExecution: Date;
  days: number;
  counter: number;
  inspectionPointId: string[];
  operatorId: string[];
  assetId: string[];
  plannedDuration: string;
  spareParts?: SparePartPreventive[];
}

export interface UpdatePreventiveRequest extends CreatePreventiveRequest {
  id: string;
  active: boolean;
}

export interface GetWOByPreventiveIdRequest {
  preventiveId: string;
  startTime: Date;
  endTime: Date;
}

export interface AssignOperatorToPreventivesRequest {
  operatorId: string;
  preventiveIds: string[];
}

export interface DailyPreventives {
  date: Date;
  preventives?: DailyPreventivesAndOperations[];
}

export interface DailyPreventivesAndOperations {
  preventive: Preventive;
  workOrder: WorkOrder | null;
}

export interface BatchExecutePreventivesRequest {
  items: BatchPreventiveItem[];
  userId: string;
  operatorId: string;
}

export interface BatchPreventiveItem {
  preventiveId: string;
  executionDate: Date;
}

export interface ScheduledPreventiveItem {
  id: string;
  preventive: Preventive;
  workOrder: WorkOrder | null;
  scheduledDate: Date;
  isLaunched: boolean;
}
