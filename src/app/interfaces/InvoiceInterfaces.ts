export interface InvoiceDto {
  id: string;
  code: string;
  invoiceDate: string;
  dueDate: string;
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyPostalCode: string;
  companyProvince: string;
  externalComments: string;
  subtotal: number;
  totalTax: number;
  total: number;
  status: InvoiceStatus;
  workOrderIds: string[];
  items: InvoiceItemDto[];
  customRates: InvoiceRateDto[];
  active: boolean;
  creationDate: string;
}

export interface InvoiceItemDto {
  id: string;
  type: InvoiceItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  discountAmount: number;
  lineTotal: number;
  workOrderId?: string;
  sparePartId?: string;
  operatorId?: string;
  operatorType?: OperatorType;
}

export interface InvoiceRateDto {
  id: string;
  operatorType: OperatorType;
  hourlyRate: number;
  description: string;
}

export interface InvoiceCreationRequest {
  workOrderIds: string[];
  invoiceDate: string;
  dueDate: string;
  externalComments: string;
  customRates: InvoiceRateDto[];
  items: InvoiceItemCreationDto[];
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyPostalCode: string;
  companyProvince: string;
}

export interface InvoiceItemCreationDto {
  type: InvoiceItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  discountAmount: number;
  workOrderId?: string;
  sparePartId?: string;
  operatorId?: string;
  operatorType?: OperatorType;
}

export interface UpdateInvoiceRequest {
  id: string;
  externalComments: string;
  customRates: InvoiceRateDto[];
  status: InvoiceStatus;
  items: InvoiceItemCreationDto[];
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyPostalCode: string;
  companyProvince: string;
}

export interface InvoiceListRequest {
  startDate?: string;
  endDate?: string;
  status?: InvoiceStatus;
  companyName?: string;
}

export enum InvoiceStatus {
  Draft = "Draft",
  Sent = "Sent",
  Paid = "Paid",
  Overdue = "Overdue",
  Cancelled = "Cancelled"
}

export enum InvoiceItemType {
  Labor = "Labor",
  SparePart = "SparePart",
  Other = "Other"
}

export enum OperatorType {
  Maintenance = "Maintenance",
  Production = "Production",
  Quality = "Quality"
}