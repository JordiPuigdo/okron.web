import { WorkOrderType } from "app/interfaces/workOrder";

export interface FilterWorkOrders extends Filter {
  workOrderType?: WorkOrderType;
  assetId?: string;
  code?: string;
}

interface Filter {
  startDateTime: Date;
  endDateTime: Date;
}

export interface FilterSpareParts {
  code?: string;
  description?: string;
  family?: string;
  refSupplier?: string;
  ubication?: string;
}
