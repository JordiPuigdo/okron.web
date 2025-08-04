export enum DeliveryNoteStatus {
  Draft = 0,
  Sent = 1,
  Paid = 2,
  Overdue = 3,
  Cancelled = 4
}

export enum DeliveryNoteItemType {
  Labor,
  SparePart,
  Other
}

export interface DeliveryNote {
  id: string;
  code: string;
  deliveryNoteDate: string;
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
  status: DeliveryNoteStatus;
  workOrderIds: string[];
  items: DeliveryNoteItem[];
  active: boolean;
  creationDate: string;
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
  items: DeliveryNoteItem[];
  companyName?: string;
  companyAddress?: string;
}