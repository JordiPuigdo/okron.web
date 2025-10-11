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

export function getDefaultFiltersCRM(): WorkOrdersFilters {
  return {
    dateRange: { startDate: null, endDate: null },
    workOrderType: [],
    workOrderState: [StateWorkOrder.Finished, StateWorkOrder.NotFinished],
    searchTerm: '',
    assetId: '',
    refCustomerId: '',
    customerName: '',
    isInvoiced: false,
    hasDeliveryNote: false,
    active: true,
    useOperatorLogged: false,
  };
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
  f.searchTerm = filters.searchTerm?.trim() ?? '';
  f.assetId = filters.assetId ?? '';
  f.refCustomerId = filters.refCustomerId ?? '';
  f.customerName = filters.customerName ?? '';
  f.isInvoiced = filters.isInvoiced;
  f.hasDeliveryNote = filters.hasDeliveryNote;
  f.useOperatorLogged = filters.useOperatorLogged;
  return f;
}
export function mapQueryParamsToFilters(
  query: FilterValue,
  userType?: UserType,
  prev?: WorkOrdersFilters
): Partial<WorkOrdersFilters> {
  return {
    workOrderType: query.workOrderType
      ? query.workOrderType
          .toString()
          .split(',')
          .map(Number)
          .filter(n => !isNaN(n))
      : prev?.workOrderType ?? [],
    workOrderState: query.workOrderState
      ? query.workOrderState
          .toString()
          .split(',')
          .map(Number)
          .filter(n => !isNaN(n))
      : prev?.workOrderState ??
        (userType === UserType.CRM
          ? [StateWorkOrder.Finished, StateWorkOrder.NotFinished]
          : []),
    dateRange: {
      startDate: query.startDate
        ? dayjs(query.startDate.toString(), 'YYYY-MM-DD').toDate()
        : prev?.dateRange.startDate ?? null,
      endDate: query.endDate
        ? dayjs(query.endDate.toString(), 'YYYY-MM-DD').toDate()
        : prev?.dateRange.endDate ?? dayjs().startOf('day').toDate(),
    },
    searchTerm: query.searchTerm?.toString() ?? prev?.searchTerm ?? '',
    assetId: query.assetId?.toString() ?? prev?.assetId ?? '',
    refCustomerId: query.refCustomerId?.toString() ?? prev?.refCustomerId ?? '',
    customerName: query.customerName?.toString() ?? prev?.customerName ?? '',
    isInvoiced:
      (query.isInvoiced === 'true' ||
        query.isInvoiced === true ||
        prev?.isInvoiced) ??
      false,
    hasDeliveryNote:
      (query.hasDeliveryNote === 'true' ||
        query.hasDeliveryNote === true ||
        prev?.hasDeliveryNote) ??
      false,
    useOperatorLogged:
      (query.useOperatorLogged === 'true' ||
        query.useOperatorLogged === true ||
        prev?.useOperatorLogged) ??
      false,
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
      order.asset?.description?.toLowerCase().includes(t) ||
      order.asset?.brand?.toLowerCase().includes(t) ||
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

  const matchesActive =
    filters.active === undefined || order.active === filters.active;

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
    matchesDelivery &&
    matchesActive
  );
}
