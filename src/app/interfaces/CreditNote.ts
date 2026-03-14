import { BaseModel } from './BaseModel';

export enum CreditNoteType {
  Total,
  Partial,
  External,
}

export interface CreditNoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  discountAmount: number;
  taxPercentage: number;
  subtotal: number;
  total: number;
}

export interface CreditNote extends BaseModel {
  code: string;
  originalInvoiceId?: string;
  originalInvoiceCode?: string;
  externalInvoiceCode?: string;
  creditNoteDate: Date;
  type: CreditNoteType;
  reason?: string;
  creditPercentage?: number;
  items: CreditNoteItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  companyName?: string;
  customerId?: string;
}

export interface CreditNoteItemRequest {
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxPercentage?: number;
}

export interface CreditNoteCreationRequest {
  originalInvoiceId?: string;
  externalInvoiceCode?: string;
  creditNoteDate?: string;
  type: CreditNoteType;
  reason?: string;
  creditPercentage?: number;
  items?: CreditNoteItemRequest[];
  selectedItemIds?: string[];
}

export interface CreditNoteUpdateRequest {
  id: string;
  reason?: string;
  customerId?: string | null;
  items?: CreditNoteItemRequest[];
}

export interface CreditNoteSearchFilters {
  companyName?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  type?: CreditNoteType;
  originalInvoiceCode?: string;
  creditNoteCode?: string;
}

export interface CreditNoteListRequest {
  startDate?: string;
  endDate?: string;
  companyName?: string;
  originalInvoiceId?: string;
  type?: CreditNoteType;
}
