import { BaseModel } from './BaseModel';
import { CustomerAddress, CustomerInstallations } from './Customer';
import { TaxBreakdown } from './DeliveryNote';

export enum BudgetStatus {
  Draft = 0,
  Sent = 1,
  Accepted = 2,
  Rejected = 3,
  Expired = 4,
  Cancelled = 5,
  Converted = 6,
}

export enum BudgetItemType {
  Labor = 0,
  SparePart = 1,
  Other = 2,
}

export interface Budget extends BaseModel {
  code: string;
  budgetDate: string;
  validUntil: string;
  companyName?: string;
  customerId?: string;
  customerNif?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: CustomerAddress;
  externalComments?: string;
  internalComments?: string;
  subtotal: number;
  totalTax: number;
  total: number;
  status: BudgetStatus;
  installation?: CustomerInstallations;
  workOrderId?: string;
  workOrderCode?: string;
  deliveryNoteId?: string;
  deliveryNoteCode?: string;
  items: BudgetItem[];
  taxBreakdowns: TaxBreakdown[];
}

export interface BudgetItem extends BaseModel {
  type: BudgetItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  discountAmount: number;
  lineTotal: number;
  taxPercentage: number;
  sparePartId?: string;
  operatorId?: string;
}

/** DTO para crear un nuevo item (sin id ni lineTotal calculado) */
export interface BudgetItemCreationDto {
  type: BudgetItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  discountAmount?: number;
  taxPercentage?: number;
  sparePartId?: string;
  operatorId?: string;
}

export interface BudgetCreationRequest {
  customerId: string;
  workOrderId?: string;
  budgetDate: string;
  validUntil: string;
  customerInstallationId?: string;
  items?: BudgetItemCreationDto[];
  externalComments?: string;
  internalComments?: string;
}

export interface BudgetUpdateRequest {
  id: string;
  externalComments?: string;
  internalComments?: string;
  status: BudgetStatus;
  validUntil?: string;
  items: BudgetItem[];
}

export interface BudgetSearchFilters {
  companyName?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  status?: BudgetStatus;
  budgetCode?: string;
  minAmount?: number;
  maxAmount?: number;
  workOrderId?: string;
  hasDeliveryNote?: boolean;
}

export interface ConvertBudgetToDeliveryNoteRequest {
  budgetId: string;
  deliveryNoteDate: string;
}
