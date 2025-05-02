import { Asset } from './Asset';
import InspectionPoint from './inspectionPoint';
import Machine from './machine';
import Operator from './Operator';
import SparePart from './SparePart';

export interface Preventive {
  id: string;
  code: string;
  description: string;
  machine: Machine;
  startExecution: Date;
  lastExecution: Date;
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
