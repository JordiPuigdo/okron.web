import { BaseModel } from './BaseModel';
import { Provider } from './Provider';
import SparePart from './SparePart';
import { WareHouse } from './WareHouse';

export interface OrderSimple extends BaseModel {
  code: string;
  providerId: string;
  provider?: Provider;
  items: OrderItem[];
  status: OrderStatus;
  type: OrderType;
  comment: string;
  date: string;
  relationOrders?: RelationOrder[];
  providerName?: string;
  deliveryProviderDate?: string;
  deliveryProviderCode?: string;
  account?: string;
  accountId?: string;
  totalAmount?: number;
}

export interface RelationOrder {
  relationOrderId: string;
  relationOrderCode: string;
}

export interface Order extends OrderSimple {
  orderEvents: OrderEvents[];
}

export enum OrderStatus {
  Pending,
  InProgress,
  Completed,
  Cancelled,
}

export enum OrderType {
  Purchase,
  Delivery,
  Return,
}

export interface OrderItem extends BaseModel {
  sparePartId: string;
  sparePartName: string;
  quantity: number;
  quantityReceived: number;
  unitPrice: string;
  sparePart: SparePart;
  wareHouseId: string;
  wareHouse?: WareHouse;
  wareHouseName: string;
  quantityPendient?: number;
  estimatedDeliveryDate?: string;
  refProvider: string;
  discount: number;
}

export interface OrderEvents extends BaseModel {
  comment: string;
  status: OrderStatus;
}

export interface OrderCreationRequest {
  code: string;
  providerId: string;
  items: OrderItemRequest[];
  status: OrderStatus;
  type: OrderType;
  comment: string;
  date: string;
  relationOrderId?: string;
  relationOrderCode?: string;
  operatorId?: string;
  active: boolean;
  providerName?: string;
  deliveryProviderDate?: string;
  deliveryProviderCode?: string;
  relationOrders?: RelationOrder[];
  accountId?: string;
  account?: string;
  totalAmount?: number;
}

export interface OrderItemRequest {
  id?: string;
  sparePartId: string;
  sparePart: SparePart;
  sparePartName?: string;
  quantity: number;
  unitPrice: string;
  wareHouseId?: string;
  wareHouseName: string;
  providerId?: string;
  provider?: Provider;
  wareHouse?: WareHouse;
  quantityReceived?: number;
  quantityPendient?: number;
  estimatedDeliveryDate?: string;
  refProvider: string;
  discount: number;
}

export interface OrderUpdateRequest extends OrderCreationRequest {
  id: string;
}

export interface GetOrderWithFiltersRequest {
  orderType?: OrderType;
  from?: Date;
  to?: Date;
  providerId?: string;
  sparePartId?: string;
  ids?: string[];
}
