import { BaseModel } from './BaseModel';
import SparePart from './SparePart';

export interface WareHouseDetail extends WareHouse {
  totalStock: number;
  highStock: number;
  lowStock: number;
}

export interface WareHouse extends BaseModel {
  code: string;
  description: string;
  stock?: WareHouseStock[];
  isVirtual: boolean;
}

export interface WareHouseStock {
  sparePartId: string;
  providerId: string;
  quantity: number;
  price: string;
  sparePart: SparePart;
  lastUpdate: string;
  isBelowMinimum: boolean;
}

export interface WareHouseRequest {
  code: string;
  description: string;
  isVirtual: boolean;
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

export interface WareHouseStockAvailability {
  sparePartId: string;
  sparePartCode: string;
  sparePartName: string;
  warehouseStock: StockAvailability[];
}

export interface StockAvailability {
  warehouseId: string;
  warehouse: string;
  stock: number;
}
