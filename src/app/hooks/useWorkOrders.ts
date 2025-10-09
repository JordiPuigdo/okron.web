import { useEffect, useMemo, useState } from 'react';
import { WorkOrderTypeCount } from 'app/(pages)/workOrders/components/WorkOrderFiltersTable/WorkOrderTypeCount';
import { OperatorType } from 'app/interfaces/Operator';
import { UserType } from 'app/interfaces/User';
import WorkOrder, {
  OriginWorkOrder,
  SearchWorkOrderFilters,
  StateWorkOrder,
  WorkOrdersFilters,
  WorkOrderType,
} from 'app/interfaces/workOrder';
import { workOrderService } from 'app/services/workOrderService';
import { useSessionStore } from 'app/stores/globalStore';
import {
  applyFilters,
  getFilters,
  getValidStates,
  mapQueryParamsToFilters,
} from 'app/utils/utilsWorkOrder';
import { Fetcher } from 'swr';

import { useQueryParams } from './useFilters';

const fetchWorkOrdersWithFilters = async (
  filters?: SearchWorkOrderFilters
): Promise<WorkOrder[]> => {
  try {
    if (filters) {
      const response = await workOrderService.getWorkOrdersWithFilters(filters);
      return response;
    }
    return [];
  } catch (error) {
    console.error('Error fetching work orders with filters:', error);
    throw error;
  }
};

const fetchWorkOrderById = async (id: string): Promise<WorkOrder> => {
  try {
    const response = await workOrderService.getWorkOrderById(id);
    return response!;
  } catch (error) {
    console.error('Error fetching work order by ID:', error);
    throw error;
  }
};

export const useWorkOrders = (initialFilters?: WorkOrdersFilters) => {
  const { loginUser, operatorLogged } = useSessionStore(state => state);
  const { updateQueryParams, queryParams } = useQueryParams();
  const [firstLoad, setFirstLoad] = useState(true);
  const [workOrderTypeCount, setWorkOrderTypeCount] = useState<
    WorkOrderTypeCount[]
  >([]);

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  const [filters, setFilters] = useState<WorkOrdersFilters>(
    initialFilters || {
      dateRange: { startDate: null, endDate: null },
      workOrderType: [],
      workOrderState: [],
      searchTerm: '',
      assetId: '',
      refCustomerId: '',
      customerName: '',
      isInvoiced: false,
      hasDeliveryNote: false,
      active: true,
    }
  );

  useEffect(() => {
    updateQueryParams(getFilters(filters));
  }, [filters]);

  useEffect(() => {
    if (firstLoad && queryParams) {
      setFilters(prev => ({
        ...prev,
        ...mapQueryParamsToFilters(queryParams, loginUser?.userType, prev),
      }));
      setFirstLoad(false);
    }
  }, [queryParams, loginUser, firstLoad]);

  useEffect(() => {
    if (
      filters.dateRange.startDate != null &&
      filters.dateRange.endDate != null
    ) {
      fetchWorkOrders();
    }
  }, [
    filters.dateRange.startDate,
    filters.dateRange.endDate,
    operatorLogged?.idOperatorLogged,
  ]);

  async function fetchWorkOrders() {
    try {
      const search: SearchWorkOrderFilters = {
        assetId: '',
        operatorId: operatorLogged?.idOperatorLogged || '',
        startDateTime: filters.dateRange.startDate!,
        endDateTime: filters.dateRange.endDate!,
        originWorkOrder:
          loginUser?.userType === UserType.Maintenance
            ? OriginWorkOrder.Maintenance
            : OriginWorkOrder.Production,
        userType: loginUser!.userType,
      };

      if (operatorLogged?.operatorLoggedType === OperatorType.Quality) {
        search.stateWorkOrder = [StateWorkOrder.PendingToValidate];
        search.startDateTime = undefined;
        search.endDateTime = undefined;
      }

      const data = await workOrderService.getWorkOrdersWithFilters(search);
      setWorkOrders(data);
    } catch (e) {
      console.error('Error fetching work orders', e);
    }
  }

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(order => applyFilters(order, filters));
  }, [workOrders, filters]);

  const computedTypeCounts = useMemo<WorkOrderTypeCount[]>(() => {
    if (!filteredWorkOrders || filteredWorkOrders.length === 0) return [];
    const map = new Map<WorkOrderType, number>();

    for (const order of filteredWorkOrders) {
      const t = order.workOrderType as unknown as WorkOrderType | undefined;
      if (t === undefined) continue;
      map.set(t, (map.get(t) ?? 0) + 1);
    }

    return Array.from(map.entries()).map(([workOrderType, count]) => ({
      workOrderType,
      count,
    }));
  }, [filteredWorkOrders]);

  useEffect(() => {
    setWorkOrderTypeCount(computedTypeCounts);
  }, [computedTypeCounts]);

  const validStates = useMemo(
    () => getValidStates(loginUser?.userType!),
    [loginUser]
  );

  const fetchById: Fetcher<WorkOrder, string> = id => fetchWorkOrderById(id);

  const fetchWithFilters = async (
    filters?: SearchWorkOrderFilters
  ): Promise<WorkOrder[]> => {
    return await fetchWorkOrdersWithFilters(filters);
  };

  const generateWorkOrderCode = async (
    workOrderType: WorkOrderType
  ): Promise<string> => {
    try {
      const response = await workOrderService.generateWorkOrderCode(
        workOrderType
      );
      return response;
    } catch (error) {
      console.error('Error generating work order code:', error);
      throw error;
    }
  };

  const createRepairWorkOrder = async (data: any): Promise<WorkOrder> => {
    try {
      const response = await workOrderService.createWorkOrder(data, '');
      return response;
    } catch (error) {
      console.error('Error creating work order:', error);
      throw error;
    }
  };

  return {
    fetchById,
    fetchWithFilters,
    createRepairWorkOrder,
    generateWorkOrderCode,
    filters,
    setFilters,
    filteredWorkOrders,
    validStates,
    workOrderTypeCount,
  };
};
