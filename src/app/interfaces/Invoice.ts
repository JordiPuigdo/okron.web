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
  deliveryNoteId: string;
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
  deliveryNoteId?: string;
  sparePartId?: string;
  operatorId?: string;
  operatorType?: string | null;
  active: boolean;
  creationDate: string;
}

export interface InvoiceCreateRequest {
  deliveryNoteId: string;
  invoiceDate: string;
  dueDate: string;
}

export interface InvoiceUpdateRequest {
  id: string;
  externalComments?: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  companyName?: string;
  companyAddress?: string;
  companyCity?: string;
  companyPostalCode?: string;
  companyProvince?: string;
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
