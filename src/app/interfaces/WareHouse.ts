import { BaseModel } from './BaseModel';
import SparePart from './SparePart';

export interface WareHouse extends BaseModel {
  code: string;
  description: string;
  stock?: WareHouseStock[];
}

export interface WareHouseStock {
  sparePartId: string;
  providerId: string;
  quantity: number;
  price: string;
  sparePart: SparePart;
  lastUpdate: string;
}

export interface WareHouseRequest {
  code: string;
  description: string;
}

export interface UpdateWareHouseRequest extends WareHouseRequest {
  active: boolean;
  id: string;
}

export interface WareHouseSparePartRequest {
  wareHouseId: string;
  sparePartId: string;
  operatorId: string;
}
