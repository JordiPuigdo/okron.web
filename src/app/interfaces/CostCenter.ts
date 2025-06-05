import { BaseModel } from './BaseModel';

export interface CostCenter extends BaseModel {
  code: string;
  description: string;
}

export interface CreateCostCenterRequest {
  code: string;
  description: string;
}

export interface UpdateCostCenterRequest extends CreateCostCenterRequest {
  id: string;
  active: boolean;
}
