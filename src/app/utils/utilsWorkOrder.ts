import { UserType } from 'app/interfaces/User';
import WorkOrder, {
  StateWorkOrder,
  WorkOrdersFilters,
} from 'app/interfaces/workOrder';
import { FilterValue } from 'app/types/filters';
import dayjs from 'dayjs';

export function getStatesForProduction() {
  return [StateWorkOrder.Open, StateWorkOrder.Closed];
}

export function getStatesForCRM() {
  return [
    StateWorkOrder.Finished,
    StateWorkOrder.NotFinished,
    StateWorkOrder.Waiting,
  ];
}

export function getStatesForMaintenance() {
  return [
    StateWorkOrder.Waiting,
    StateWorkOrder.Paused,
    StateWorkOrder.OnGoing,
    StateWorkOrder.PendingToValidate,
    StateWorkOrder.Finished,
    StateWorkOrder.Open,
  ];
}

export function getValidStates(userType: UserType) {
  if (userType === UserType.Maintenance) {
    return getStatesForMaintenance();
  } else if (userType === UserType.Production) {
    return getStatesForProduction();
  } else {
    return getStatesForCRM();
  }
}

export function getFilters(filters: WorkOrdersFilters): FilterValue {
  const f: FilterValue = {};
  if (filters.workOrderType.length > 0)
    f.workOrderType = filters.workOrderType.join(',');
  if (filters.workOrderState.length > 0)
    f.workOrderState = filters.workOrderState.join(',');
  if (filters.dateRange.startDate)
    f.startDate = dayjs(filters.dateRange.startDate).format('YYYY-MM-DD');
  if (filters.dateRange.endDate)
    f.endDate = dayjs(filters.dateRange.endDate).format('YYYY-MM-DD');
  if (filters.searchTerm) f.searchTerm = filters.searchTerm;
  if (filters.assetId) f.assetId = filters.assetId;
  if (filters.refCustomerId) f.refCustomerId = filters.refCustomerId;
  if (filters.customerName) f.customerName = filters.customerName;
  f.isInvoiced = filters.isInvoiced;
  f.hasDeliveryNote = filters.hasDeliveryNote;
  return f;
}

export function mapQueryParamsToFilters(
  query: FilterValue,
  userType?: UserType
): Partial<WorkOrdersFilters> {
  const firstDayOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 1,
    1
  );
  return {
    workOrderType: query.workOrderType
      ? query.workOrderType
          .toString()
          .split(',')
          .map(Number)
          .filter(n => !isNaN(n))
      : [],
    workOrderState: query.workOrderState
      ? query.workOrderState
          .toString()
          .split(',')
          .map(Number)
          .filter(n => !isNaN(n))
      : userType === UserType.CRM
      ? [StateWorkOrder.Finished, StateWorkOrder.NotFinished]
      : [],
    dateRange: {
      startDate: query.startDate
        ? dayjs(query.startDate.toString(), 'YYYY-MM-DD').toDate()
        : firstDayOfMonth,
      endDate: query.endDate
        ? dayjs(query.endDate.toString(), 'YYYY-MM-DD').toDate()
        : dayjs().startOf('day').toDate(),
    },
    searchTerm: query.searchTerm?.toString() || '',
    assetId: query.assetId?.toString() || '',
    refCustomerId: query.refCustomerId?.toString() || '',
    customerName: query.customerName?.toString() || '',
    isInvoiced: query.isInvoiced === 'true' || query.isInvoiced === true,
    hasDeliveryNote:
      query.hasDeliveryNote === 'true' || query.hasDeliveryNote === true,
  };
}

export function applyFilters(
  order: WorkOrder,
  filters: WorkOrdersFilters
): boolean {
  const searchTerms = filters.searchTerm.trim().split(/\s+/);
  const matchesSearch = searchTerms.every(term => {
    if (!term) return true;
    const t = term.toLowerCase();
    return (
      order.description.toLowerCase().includes(t) ||
      order.code.toLowerCase().includes(t) ||
      order.customerWorkOrder?.customerName?.toLowerCase().includes(t) ||
      order.refCustomerId?.toLowerCase().includes(t) ||
      order.customerWorkOrder?.customerInstallationAddress?.city
        ?.toLowerCase()
        .includes(t) ||
      order.customerWorkOrder?.customerInstallationCode
        ?.toLowerCase()
        .includes(t)
    );
  });

  const matchesInvoiced =
    filters.isInvoiced === undefined || order.isInvoiced === filters.isInvoiced;
  const matchesDelivery =
    filters.hasDeliveryNote === undefined ||
    order.hasDeliveryNote === filters.hasDeliveryNote;

  return (
    matchesSearch &&
    (!filters.assetId || order.asset?.id === filters.assetId) &&
    (filters.workOrderState.length === 0 ||
      filters.workOrderState.includes(order.stateWorkOrder)) &&
    (filters.workOrderType.length === 0 ||
      filters.workOrderType.includes(order.workOrderType)) &&
    matchesInvoiced &&
    matchesDelivery
  );
}
