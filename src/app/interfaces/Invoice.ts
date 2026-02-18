import { BaseModel } from './BaseModel';
import { PaymentMethod } from './Customer';
import { DeliveryNote } from './DeliveryNote';

export enum InvoiceStatus {
  Pending,
  Invoiced,
}

export enum InvoiceItemType {
  Labor,
  SparePart,
  Other,
}

export interface Invoice extends BaseModel {
  code: string;
  status: InvoiceStatus;
  dueDate: Date;
  deliveryNoteIds: string[];
  deliveryNotes: DeliveryNote[];
  paymentMethod: PaymentMethod;
}

export interface InvoiceCreateRequest {
  deliveryNoteIds: string[];
  invoiceDate: string;
  dueDate: string;
}

export interface InvoiceUpdateRequest {
  id: string;
  code: string;
  status: InvoiceStatus;
  deliveryNoteIds?: string[];
}

export interface InvoiceSearchFilters {
  companyName?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  status?: InvoiceStatus;
  deliveryNoteId?: string;
  invoiceCode?: string;
  minAmount?: number;
  maxAmount?: number;
  hasDeliveryNote?: boolean;
}

export interface DeliveryNoteSearchFilters {
  companyName?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  deliveryNoteCode?: string;
  minAmount?: number;
  maxAmount?: number;
  hasInvoice?: boolean;
  workOrderIds?: string[];
}
