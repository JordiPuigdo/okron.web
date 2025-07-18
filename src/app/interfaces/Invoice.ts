import { Customer } from './Customer';
import WorkOrder from './workOrder';

export enum InvoiceStatus {
  Draft = 0,
  Pending = 1,
  Paid = 2,
  Cancelled = 3,
  Overdue = 4
}

export enum InvoiceItemType {
  Labor,
  SparePart,
  Other
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  workOrderId?: string;
  workOrder?: WorkOrder;
}

export interface Invoice {
  id: string;
  code: string;
  date: string;
  dueDate: string;
  customerId: string;
  customer?: Customer;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  workOrderIds: string[];
  workOrders?: WorkOrder[];
  creationDate: string;
  comment?: string;
}

export interface InvoiceCreateRequest {
  date: string;
  dueDate: string;
  customerId: string;
  workOrderIds: string[];
  comment?: string;
}

export interface InvoiceUpdateRequest {
  id: string;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  comment?: string;
}