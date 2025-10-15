import { BaseModel } from './BaseModel';
import {
  CustomerAddress,
  CustomerInstallations,
  PaymentMethod,
} from './Customer';

export enum DeliveryNoteStatus {
  Draft = 0,
  Sent = 1,
  Paid = 2,
  Valued = 3,
  NotValued = 4,
  Cancelled = 5,
}

export enum DeliveryNoteItemType {
  Labor,
  SparePart,
  Other,
}

export interface DeliveryNote extends BaseModel {
  code: string;
  deliveryNoteDate: string;
  companyName: string;
  customerPhone: string;
  customerEmail: string;
  customerNif: string;
  customerAddress: CustomerAddress;
  externalComments: string | null;
  subtotal: number;
  totalTax: number;
  total: number;
  status: DeliveryNoteStatus;
  installation?: CustomerInstallations;
  workOrders: DeliveryNoteWorkOrder[];
  isInvoiced: boolean;
}

export interface DeliveryNoteWorkOrder {
  workOrderId: string;
  workOrderCode: string;
  workOrderDescription: string;
  workOrderRefId: string;
  workOrderStartTime: Date;
  concept: string;
  items: DeliveryNoteItem[];
}

export interface DeliveryNoteItem {
  id?: string;
  type: number;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  discountAmount: number;
  lineTotal: number;
  workOrderId?: string;
  sparePartId?: string;
  operatorId?: string;
  operatorType?: string | null;
  active: boolean;
  creationDate: string;
}

export interface DeliveryNoteCreateRequest {
  customerId: string;
  workOrderIds: string[];
  deliveryNoteDate: string;
  dueDate: string;
}

export interface DeliveryNoteUpdateRequest {
  id: string;
  externalComments?: string;
  status: DeliveryNoteStatus | string;
  workOrders: DeliveryNoteWorkOrder[];
}
