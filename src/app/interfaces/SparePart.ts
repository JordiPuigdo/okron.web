import { Documentation } from './Documentation';
import Operator from './Operator';
import { Provider } from './Provider';

interface SparePart {
  id: string;
  code: string;
  description: string;
  refProvider: string;
  family: string;
  ubication: string;
  stock: number;
  brand: string;
  unitsConsum?: number;
  price: number;
  active: boolean;
  documentation: Documentation[];
  minium: number;
  maximum: number;
  colorRow: string;
  lastMovementConsume: Date;
  lastMovement: Date;
  lastRestockDate: Date;
  providers: ProviderSpareParts[];
  warehouses: WarehousesSparePart[];
}

export interface ProviderSpareParts {
  providerId: string;
  price: string;
  sparePart?: SparePart;
  provider?: Provider;
  isDefault: boolean;
  discount: number;
}

export interface WarehousesSparePart {
  warehouseId: string;
  warehouseName: string;
}

export default SparePart;

export interface RestoreSparePart extends ConsumeSparePart {}

export interface ConsumeSparePart {
  workOrderId: string;
  sparePartId: string;
  unitsSparePart: number;
  operatorId: string;
  warehouseId: string;
  workOrderCode: string;
}

export interface CreateSparePartRequest {
  code: string;
  description: string;
  refProvider: string;
  family: string;
  ubication?: string;
  stock?: number;
  brand?: string;
}

export interface SparePartDetailResponse {
  sparePart: SparePart;
  sparePartPerMachineResponse: SparePartPerAssetResponse[];
}

export interface SparePartPerAssetResponse {
  id: string;
  operatorName: string;
  sparePartQuantity: number;
  sparePartCode: string;
  sparePartDescription: string;
  workOrderCode: string;
  workOrderDescription: string;
  dateConsume: Date;
}

interface SparePartsConsumeds {
  quantity: number;
  operator: Operator;
  creationDate: string;
  sparePart: SparePart;
}

export interface SparePartDetailRequest {
  id?: string;
  startDate: string;
  endDate: string;
  machineId?: string;
  assetId?: string;
}

export interface SparePartsConsumedsReport {
  sparePartId: string;
  sparePartCode: string;
  sparePartDescription: string;
  sparePartNumber: number;
  date: Date;
  workOrderId: string;
  workOrderCode: string;
  workOrderDescription: string;
  operator: string;
}
