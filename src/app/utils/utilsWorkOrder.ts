import Operator from 'app/interfaces/Operator';
import { UserType } from 'app/interfaces/User';
import WorkOrder, {
  OriginWorkOrder,
  StateWorkOrder,
  WorkOrdersFilters,
  WorkOrderType,
} from 'app/interfaces/workOrder';
import { FilterValue } from 'app/types/filters';
import dayjs from 'dayjs';

export function getStatesForProduction() {
  return [StateWorkOrder.Open, StateWorkOrder.Closed];
}

export function getStatesForQuality() {
  return [
    StateWorkOrder.Open,
    StateWorkOrder.Closed,
    StateWorkOrder.PendingToValidate,
    StateWorkOrder.Finished,
  ];
}

export function getStatesForCRM() {
  return [
    StateWorkOrder.Finished,
    StateWorkOrder.NotFinished,
    StateWorkOrder.Waiting,
    StateWorkOrder.Invoiced,
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
  } else if (userType === UserType.Quality) {
    return getStatesForQuality();
  } else {
    return getStatesForCRM();
  }
}

export function getStatesForWorkOrderType(
  workOrderType: WorkOrderType,
  isCRM: boolean
): StateWorkOrder[] {
  if (workOrderType === WorkOrderType.Corrective && !isCRM) {
    return getStatesForCorrective();
  } else if (workOrderType === WorkOrderType.Preventive) {
    return getStatesForCorrective();
  } else if (workOrderType === WorkOrderType.Ticket) {
    return getStatesForTicket();
  } else {
    return getStatesForCRM();
  }
}

function getStatesForCorrective(): StateWorkOrder[] {
  return [
    StateWorkOrder.Waiting,
    StateWorkOrder.OnGoing,
    StateWorkOrder.Paused,
    StateWorkOrder.Finished,
    StateWorkOrder.PendingToValidate,
  ];
}

function getStatesForTicket(): StateWorkOrder[] {
  return [StateWorkOrder.Open, StateWorkOrder.Closed];
}

export function getFilters(filters: WorkOrdersFilters): FilterValue {
  const f: FilterValue = {};

  f.workOrderType =
    filters.workOrderType.length > 0
      ? filters.workOrderType.join(',')
      : 'undefined';

  f.workOrderState =
    filters.workOrderState.length > 0
      ? filters.workOrderState.join(',')
      : 'undefined';
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
  prev?: WorkOrdersFilters,
  operatorLogged?: Operator | undefined
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
      : prev?.workOrderState ?? [],
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

const getDefaultWorkOrderStates = (
  isCRM: boolean,
  operatorLogged: Operator | undefined
) => {
  if (!isCRM) return [];
  console.log(operatorLogged);
  if (isCRM && operatorLogged !== undefined) {
    return [
      StateWorkOrder.Waiting,
      StateWorkOrder.Finished,
      StateWorkOrder.NotFinished,
    ];
  }
  if (isCRM) {
    return [StateWorkOrder.Finished, StateWorkOrder.NotFinished];
  }

  return [];
};

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
        .includes(t) ||
      order.operatorsNames?.toLowerCase().includes(t)
    );
  });

  const matchesActive =
    filters.active === undefined || order.active === filters.active;
  const matchesInvoiced =
    filters.isInvoiced === undefined || order.isInvoiced === filters.isInvoiced;
  const matchesDelivery =
    filters.hasDeliveryNote === undefined ||
    order.hasDeliveryNote === filters.hasDeliveryNote;

  console.log(filters.workOrderState);

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

export default function getWorkOrderFilterOrigin(
  userType: UserType
): OriginWorkOrder {
  if (userType === UserType.Maintenance || userType === UserType.CRM) {
    return OriginWorkOrder.Maintenance;
  } else if (userType === UserType.Production) {
    return OriginWorkOrder.Production;
  } else {
    return OriginWorkOrder.Quality;
  }
}
