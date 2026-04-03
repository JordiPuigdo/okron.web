import { BaseModel } from './BaseModel';

export enum AssetType {
  Default = 0,
  Factory = 1,
  Area = 2,
  Line = 3,
  Machine = 4,
  Component = 5,
  Vehicle = 6,
  System = 7,
}

export interface Asset extends BaseModel {
  level: number;
  code: string;
  description: string;
  parentId: string;
  childs: Asset[];
  path?: string;
  createWorkOrder: boolean;
  brand?: string;
  assetType: AssetType;
}

export interface CreateAssetRequest {
  code: string;
  description: string;
  level: number;
  parentId: string;
  createWorkOrder: boolean;
  brand?: string;
  assetType: AssetType;
}

export interface UpdateAssetRequest extends CreateAssetRequest {
  id: string;
  active: boolean;
}
