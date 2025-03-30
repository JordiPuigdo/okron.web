export interface PurchaseProposal {
  providerId: string;
  providerName: string;
  items: PurchaseProposalItem[];
}

export interface PurchaseProposalItem {
  sparePartId: string;
  sparePartName: string;
  quantity: number;
  unitPrice: number;
  stockMin: number;
  stockMax: number;
  realStock: number;
  warehouse: string;
  warehouseId: string;
}
