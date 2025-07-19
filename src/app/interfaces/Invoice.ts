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

export interface Invoice {
  id: string;
  code: string;
  invoiceDate: string;
  dueDate: string;
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyPostalCode: string;
  companyProvince: string | null;
  externalComments: string | null;
  subtotal: number;
  totalTax: number;
  total: number;
  status: InvoiceStatus;
  workOrderIds: string[];
  items: InvoiceItem[];
  active: boolean;
  creationDate: string;
}

export interface InvoiceItem {
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