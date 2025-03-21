import { BaseModel } from './BaseModel';

export interface StockMovement extends BaseModel {
  quanity: number;
  sparePartId: string;
  codeOrder: string;
  stockMovementType: StockMovementType;
  sparePartCode: string;
  sparePartDescription: string;
  providerInfo: string;
}

export interface StockMovementFilters {
  wareHouseId: string;
  from: Date;
  to: Date;
}

export enum StockMovementType {
  StockEntry,
  StockConsumption,
  StockTransfer,
  StockAdjustment,
  StockLoss,
  StockReturn,
}
