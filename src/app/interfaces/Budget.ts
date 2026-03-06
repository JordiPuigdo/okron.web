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

export enum BudgetType {
  Repair = 0,
  Assembly = 1,
}

export enum BudgetNodeType {
  Folder = 0,
  ArticleItem = 1,
}

export interface Budget extends BaseModel {
  code: string;
  title?: string;
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
  budgetType: BudgetType;
  items: BudgetItem[];
  assemblyNodes?: AssemblyNode[];
  taxBreakdowns: TaxBreakdown[];
  marginPercentage: number;
  currentVersionNumber?: number;
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

interface AssemblyNodeBase {
  id: string;
  code: string;
  description: string;
  sortOrder: number;
  totalAmount: number;
}

export interface AssemblyFolder extends AssemblyNodeBase {
  nodeType: BudgetNodeType.Folder;
  children: AssemblyNode[];
  marginPercentage: number;
}

export interface AssemblyArticle extends AssemblyNodeBase {
  nodeType: BudgetNodeType.ArticleItem;
  articleId: string;
  articleCode: string;
  quantity: number;
  unitPrice: number;
  marginPercentage: number;
  subtotal: number;
}

export type AssemblyNode = AssemblyFolder | AssemblyArticle;

export interface AssemblyBudgetCreationRequest {
  customerId: string;
  budgetDate: string;
  validUntil: string;
  customerInstallationId?: string;
  externalComments?: string;
  internalComments?: string;
}

export interface UpdateAssemblyBudgetRequest {
  id: string;
  title?: string;
  externalComments?: string;
  internalComments?: string;
  status?: BudgetStatus;
  validUntil?: string;
  marginPercentage?: number;
  assemblyNodes?: AssemblyNode[];
}

export interface AddAssemblyFolderRequest {
  budgetId: string;
  parentNodeId?: string;
  code: string;
  description: string;
  sortOrder?: number;
}

export interface AddAssemblyArticleRequest {
  budgetId: string;
  parentNodeId?: string;
  articleId: string;
  quantity: number;
  unitPrice: number;
  marginPercentage?: number;
  sortOrder?: number;
}

export interface MoveAssemblyNodeRequest {
  budgetId: string;
  nodeId: string;
  newParentNodeId?: string | null;
  newSortOrder: number;
}

export interface RemoveAssemblyNodeRequest {
  budgetId: string;
  nodeId: string;
}

export interface UpdateAssemblyNodeRequest {
  budgetId: string;
  nodeId: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  marginPercentage?: number;
}

export interface UpdateAssemblyMarginRequest {
  budgetId: string;
  marginPercentage: number;
}

export interface UpdateAssemblyNodesMarginRequest {
  budgetId: string;
  nodeIds: string[];
  marginPercentage: number;
}

export interface BudgetVersion extends BaseModel {
  budgetId: string;
  versionNumber: number;
  description?: string;
  operatorId?: string;
  snapshot: Budget;
}

export interface BudgetVersionSummary extends BaseModel {
  budgetId: string;
  versionNumber: number;
  versionDate: Date;
  description?: string;
  operatorId?: string;
}

export interface CreateBudgetVersionRequest {
  budgetId: string;
  operatorId?: string;
  description?: string;
}

export interface RestoreBudgetVersionRequest {
  budgetId: string;
  versionId: string;
}

export interface AssemblyNodeStructureDto {
  id: string;
  nodeType: BudgetNodeType;
  sortOrder: number;
  children?: AssemblyNodeStructureDto[];
}

export interface ReorganizeAssemblyNodesRequest {
  budgetId: string;
  assemblyNodes: AssemblyNodeStructureDto[];
}
