import { BaseModel } from './BaseModel';

export interface StockMovement extends BaseModel {
  quantity: number;
  quanity?: number; // Legacy typo - keeping for backwards compatibility
  sparePartId: string;
  sparePartCode: string;
  sparePartDescription?: string;
  stockMovementType: StockMovementType;
  relatedDocumentId?: string;
  relatedDocumentCode?: string;
  codeOrder?: string;
  providerInfo: string;
  wareHouseOriginId?: string;
  wareHouseDestinationId?: string;
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
