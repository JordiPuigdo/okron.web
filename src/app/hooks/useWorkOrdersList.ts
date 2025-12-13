import { useEffect, useMemo, useState } from 'react';
import { WorkOrderTypeCount } from 'app/(pages)/workOrders/components/WorkOrderFiltersTable/WorkOrderTypeCount';
import { UserType } from 'app/interfaces/User';
import WorkOrder, {
  SearchWorkOrderFilters,
  WorkOrdersFilters,
  WorkOrderType,
} from 'app/interfaces/workOrder';
import { workOrderService } from 'app/services/workOrderService';
import { useSessionStore } from 'app/stores/globalStore';
import getWorkOrderFilterOrigin, {
  applyFilters,
  getFilters,
  getUserType,
  getValidStates,
  mapQueryParamsToFilters,
} from 'app/utils/utilsWorkOrder';

import { useQueryParams } from './useFilters';

/**
 * Hook optimizado para obtener listados de WorkOrders usando el endpoint ligero
 * Implementa clean code y principios SOLID:
 * - Single Responsibility: Solo maneja la obtención y filtrado de listados de WorkOrders
 * - Separation of Concerns: Lógica de negocio separada del servicio HTTP
 */
export const useWorkOrdersList = (operatorId?: string) => {
  const { loginUser, operatorLogged } = useSessionStore(state => state);
  const { updateQueryParams, queryParams } = useQueryParams();

  const [firstLoad, setFirstLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [filters, setFilters] = useState<WorkOrdersFilters | undefined>(
    undefined
  );
  const [workOrderTypeCount, setWorkOrderTypeCount] = useState<
    WorkOrderTypeCount[]
  >([]);

  // Sincronizar filtros con query params
  useEffect(() => {
    if (!filters) return;
    updateQueryParams(getFilters(filters));
  }, [filters]);

  // Inicializar filtros desde query params
  useEffect(() => {
    if (firstLoad && queryParams) {
      if (!filters) {
        const queryParamsFilters = mapQueryParamsToFilters(
          queryParams,
          loginUser!.userType === UserType.CRM,
          operatorId !== undefined,
          undefined
        );
        setFilters(queryParamsFilters);
      } else {
        setFilters(prev => ({
          ...prev,
          ...mapQueryParamsToFilters(
            queryParams,
            loginUser!.userType === UserType.CRM,
            operatorId !== undefined,
            prev
          ),
        }));
      }
    }
    setFirstLoad(false);
  }, [queryParams, loginUser, firstLoad]);

  // Fetch WorkOrders cuando cambian las fechas
  useEffect(() => {
    if (!filters) return;
    if (
      (filters.dateRange.startDate != null &&
        filters.dateRange.endDate != null) ||
      operatorLogged?.idOperatorLogged
    ) {
      fetchWorkOrdersList();
    }
  }, [
    filters?.dateRange.startDate,
    filters?.dateRange.endDate,
    operatorLogged?.idOperatorLogged,
  ]);

  /**
   * Obtiene el listado optimizado de WorkOrders desde el backend
   */
  const fetchWorkOrdersList = async (): Promise<void> => {
    if (!filters) return;

    setIsLoading(true);

    try {
      const searchFilters: SearchWorkOrderFilters = {
        assetId: '',
        operatorId: !filters.useOperatorLogged
          ? ''
          : operatorLogged?.idOperatorLogged || '',
        startDateTime: filters.dateRange.startDate!,
        endDateTime: filters.dateRange.endDate!,
        originWorkOrder: getWorkOrderFilterOrigin(loginUser!.userType),
        userType: getUserType(operatorLogged, loginUser),
      };

      const data = await workOrderService.getWorkOrdersList(searchFilters);
      setWorkOrders(data);
    } catch (error) {
      console.error('Error fetching work orders list:', error);
      setWorkOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Filtra las WorkOrders en memoria según los filtros aplicados
   */
  const filteredWorkOrders = useMemo(() => {
    if (!filters) return [];
    return workOrders.filter(order => applyFilters(order, filters));
  }, [workOrders, filters]);

  /**
   * Calcula el conteo de WorkOrders por tipo
   */
  const computedTypeCounts = useMemo<WorkOrderTypeCount[]>(() => {
    if (!filteredWorkOrders || filteredWorkOrders.length === 0) return [];

    const countMap = new Map<WorkOrderType, number>();

    for (const order of filteredWorkOrders) {
      const type = order.workOrderType as unknown as WorkOrderType | undefined;
      if (type === undefined) continue;
      countMap.set(type, (countMap.get(type) ?? 0) + 1);
    }

    return Array.from(countMap.entries()).map(([workOrderType, count]) => ({
      workOrderType,
      count,
    }));
  }, [filteredWorkOrders]);

  // Actualizar conteos cuando cambien las WorkOrders filtradas
  useEffect(() => {
    setWorkOrderTypeCount(computedTypeCounts);
  }, [computedTypeCounts]);

  /**
   * Calcula los estados válidos según el tipo de usuario
   */
  const validStates = useMemo(
    () => getValidStates(loginUser?.userType!),
    [loginUser]
  );

  /**
   * Refresca manualmente el listado de WorkOrders
   */
  const refreshWorkOrders = async (): Promise<void> => {
    await fetchWorkOrdersList();
  };

  return {
    filters,
    setFilters,
    filteredWorkOrders,
    validStates,
    workOrderTypeCount,
    isLoading,
    refreshWorkOrders,
  };
};
