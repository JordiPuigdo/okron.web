'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Asset } from 'app/interfaces/Asset';
import Operator from 'app/interfaces/Operator';
import {
  BatchExecutePreventivesRequest,
  DailyPreventives,
  Preventive,
  ScheduledPreventiveItem,
} from 'app/interfaces/Preventive';
import { WorkOrder } from 'app/interfaces/workOrder';
import PreventiveService from 'app/services/preventiveService';
import { useSessionStore } from 'app/stores/globalStore';

export type LaunchStatus = 'all' | 'pending' | 'launched';

export interface ScheduledPreventivesFilters {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  assetId: string;
  operatorId: string;
  machineId: string;
  launchStatus: LaunchStatus;
  searchTerm: string;
}

const getDefaultDateRange = () => {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
};

const getDefaultFilters = (): ScheduledPreventivesFilters => ({
  dateRange: getDefaultDateRange(),
  assetId: '',
  operatorId: '',
  machineId: '',
  launchStatus: 'all',
  searchTerm: '',
});

/**
 * Hook para gestionar preventivos programados (futuros)
 * Permite visualizar, filtrar y lanzar preventivos en batch
 */
export const useScheduledPreventives = () => {
  const { loginUser, operatorLogged } = useSessionStore(state => state);

  const [isLoading, setIsLoading] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<DailyPreventives[]>([]);
  const [filters, setFilters] = useState<ScheduledPreventivesFilters>(
    getDefaultFilters()
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const preventiveService = useMemo(
    () => new PreventiveService(process.env.NEXT_PUBLIC_API_BASE_URL || ''),
    []
  );

  /**
   * Transforma DailyPreventives[] a una lista plana de ScheduledPreventiveItem[]
   */
  const transformToScheduledItems = useCallback(
    (dailyPreventives: DailyPreventives[]): ScheduledPreventiveItem[] => {
      const items: ScheduledPreventiveItem[] = [];

      for (const day of dailyPreventives) {
        if (!day.preventives || day.preventives.length === 0) continue;

        for (const entry of day.preventives) {
          const scheduledDate = new Date(day.date);
          items.push({
            id: `${entry.preventive.id}_${scheduledDate.toISOString()}`,
            preventive: entry.preventive,
            workOrder: entry.workOrder,
            scheduledDate,
            isLaunched: entry.workOrder !== null,
          });
        }
      }

      return items.sort(
        (a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime()
      );
    },
    []
  );

  /**
   * Carga los preventivos programados según el rango de fechas
   */
  const fetchScheduledPreventives = useCallback(async () => {
    if (!filters.dateRange.startDate || !filters.dateRange.endDate) return;

    setIsLoading(true);
    setError(null);

    try {
      const startStr = filters.dateRange.startDate.toISOString().split('T')[0];
      const endStr = filters.dateRange.endDate.toISOString().split('T')[0];

      const data = await preventiveService.generateSchedulePreventives(
        startStr,
        endStr
      );
      setRawData(data);
    } catch (err) {
      console.error('Error loading scheduled preventives:', err);
      setError('Error cargando preventivos programados');
      setRawData([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters.dateRange, preventiveService]);

  // Cargar datos cuando cambian las fechas
  useEffect(() => {
    fetchScheduledPreventives();
  }, [fetchScheduledPreventives]);

  /**
   * Filtra los items según los filtros aplicados
   */
  const filteredData = useMemo((): ScheduledPreventiveItem[] => {
    const items = transformToScheduledItems(rawData);

    return items.filter(item => {
      // Filtro por estado de lanzamiento
      if (filters.launchStatus === 'pending' && item.isLaunched) {
        return false;
      }
      if (filters.launchStatus === 'launched' && !item.isLaunched) {
        return false;
      }

      // Filtro por asset
      if (filters.assetId && item.preventive.asset?.id !== filters.assetId) {
        return false;
      }

      // Filtro por máquina
      if (filters.machineId && item.preventive.machine?.id !== filters.machineId) {
        return false;
      }

      // Filtro por operador asignado
      if (filters.operatorId) {
        const hasOperator = item.preventive.operators?.some(
          op => op.id === filters.operatorId
        );
        if (!hasOperator) return false;
      }

      // Filtro por término de búsqueda
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const matchesCode = item.preventive.code?.toLowerCase().includes(term);
        const matchesDescription = item.preventive.description
          ?.toLowerCase()
          .includes(term);
        const matchesAsset = item.preventive.asset?.description
          ?.toLowerCase()
          .includes(term);
        const matchesMachine = item.preventive.machine?.description
          ?.toLowerCase()
          .includes(term);
        const matchesOperator = item.preventive.operators?.some(
          op => op.name?.toLowerCase().includes(term)
        );
        if (!matchesCode && !matchesDescription && !matchesAsset && !matchesMachine && !matchesOperator) {
          return false;
        }
      }

      return true;
    });
  }, [rawData, filters, transformToScheduledItems]);

  /**
   * Toggle de selección de un item
   */
  const toggleSelection = useCallback((itemId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  /**
   * Selecciona todos los items pendientes visibles
   */
  const selectAllPending = useCallback(() => {
    const pendingIds = filteredData
      .filter(item => !item.isLaunched)
      .map(item => item.id);
    setSelectedIds(new Set(pendingIds));
  }, [filteredData]);

  /**
   * Deselecciona todos
   */
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  /**
   * Lanza los preventivos seleccionados (crea WorkOrders)
   */
  const launchSelected = useCallback(async (): Promise<WorkOrder[]> => {
    if (selectedIds.size === 0) return [];
    if (!loginUser?.agentId || !operatorLogged?.idOperatorLogged) {
      setError('Usuario no autenticado');
      return [];
    }

    setIsLaunching(true);
    setError(null);

    try {
      // Obtener los items seleccionados que NO están lanzados
      const itemsToLaunch = filteredData.filter(
        item => selectedIds.has(item.id) && !item.isLaunched
      );

      if (itemsToLaunch.length === 0) {
        setError('No hay preventivos pendientes seleccionados');
        return [];
      }

      const request: BatchExecutePreventivesRequest = {
        items: itemsToLaunch.map(item => ({
          preventiveId: item.preventive.id,
          executionDate: item.scheduledDate,
        })),
        userId: loginUser.agentId,
        operatorId: operatorLogged.idOperatorLogged,
      };

      const createdWorkOrders =
        await preventiveService.batchExecutePreventives(request);

      // Limpiar selección y recargar datos
      clearSelection();
      await fetchScheduledPreventives();

      return createdWorkOrders;
    } catch (err) {
      console.error('Error launching preventives:', err);
      setError('Error creando órdenes de trabajo');
      return [];
    } finally {
      setIsLaunching(false);
    }
  }, [
    selectedIds,
    filteredData,
    loginUser,
    operatorLogged,
    preventiveService,
    clearSelection,
    fetchScheduledPreventives,
  ]);

  /**
   * Lanza un preventivo individual
   */
  const launchSingle = useCallback(
    async (item: ScheduledPreventiveItem): Promise<WorkOrder | null> => {
      if (!loginUser?.agentId || !operatorLogged?.idOperatorLogged) {
        setError('Usuario no autenticado');
        return null;
      }

      if (item.isLaunched) {
        setError('Este preventivo ya está lanzado');
        return null;
      }

      setIsLaunching(true);
      setError(null);

      try {
        const request: BatchExecutePreventivesRequest = {
          items: [
            {
              preventiveId: item.preventive.id,
              executionDate: item.scheduledDate,
            },
          ],
          userId: loginUser.agentId,
          operatorId: operatorLogged.idOperatorLogged,
        };

        const createdWorkOrders =
          await preventiveService.batchExecutePreventives(request);

        // Recargar datos
        await fetchScheduledPreventives();

        return createdWorkOrders[0] || null;
      } catch (err) {
        console.error('Error launching preventive:', err);
        setError('Error creando orden de trabajo');
        return null;
      } finally {
        setIsLaunching(false);
      }
    },
    [loginUser, operatorLogged, preventiveService, fetchScheduledPreventives]
  );

  /**
   * Contadores para mostrar estadísticas
   */
  const stats = useMemo(() => {
    const total = filteredData.length;
    const pending = filteredData.filter(item => !item.isLaunched).length;
    const launched = filteredData.filter(item => item.isLaunched).length;
    const selectedCount = selectedIds.size;
    const selectedPendingCount = filteredData.filter(
      item => selectedIds.has(item.id) && !item.isLaunched
    ).length;

    return {
      total,
      pending,
      launched,
      selectedCount,
      selectedPendingCount,
    };
  }, [filteredData, selectedIds]);

  /**
   * Extrae assets únicos de los datos cargados
   */
  const availableAssets = useMemo((): Pick<Asset, 'id' | 'description'>[] => {
    const allItems = transformToScheduledItems(rawData);
    const assetsMap = new Map<string, Pick<Asset, 'id' | 'description'>>();
    
    for (const item of allItems) {
      if (item.preventive.asset?.id && item.preventive.asset?.description) {
        assetsMap.set(item.preventive.asset.id, {
          id: item.preventive.asset.id,
          description: item.preventive.asset.description,
        });
      }
    }
    
    return Array.from(assetsMap.values()).sort((a, b) => 
      a.description.localeCompare(b.description)
    );
  }, [rawData, transformToScheduledItems]);

  /**
   * Extrae operadores únicos de los datos cargados
   */
  const availableOperators = useMemo((): Pick<Operator, 'id' | 'name'>[] => {
    const allItems = transformToScheduledItems(rawData);
    const operatorsMap = new Map<string, Pick<Operator, 'id' | 'name'>>();
    
    for (const item of allItems) {
      if (item.preventive.operators) {
        for (const op of item.preventive.operators) {
          if (op.id && op.name) {
            operatorsMap.set(op.id, {
              id: op.id,
              name: op.name,
            });
          }
        }
      }
    }
    
    return Array.from(operatorsMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }, [rawData, transformToScheduledItems]);

  /**
   * Extrae máquinas únicas de los datos cargados
   */
  const availableMachines = useMemo((): { id: string; description: string }[] => {
    const allItems = transformToScheduledItems(rawData);
    const machinesMap = new Map<string, { id: string; description: string }>();
    
    for (const item of allItems) {
      if (item.preventive.machine?.id && item.preventive.machine?.description) {
        machinesMap.set(item.preventive.machine.id, {
          id: item.preventive.machine.id,
          description: item.preventive.machine.description,
        });
      }
    }
    
    return Array.from(machinesMap.values()).sort((a, b) => 
      a.description.localeCompare(b.description)
    );
  }, [rawData, transformToScheduledItems]);

  /**
   * Obtiene el detalle completo de un preventivo por su ID
   */
  const getPreventiveDetail = useCallback(
    async (preventiveId: string): Promise<Preventive | null> => {
      try {
        const detail = await preventiveService.getPreventive(preventiveId);
        return detail;
      } catch (err) {
        console.error('Error fetching preventive detail:', err);
        return null;
      }
    },
    [preventiveService]
  );

  return {
    // Data
    data: filteredData,
    rawData,
    stats,

    // Filter options (extracted from data)
    availableAssets,
    availableOperators,
    availableMachines,

    // Filters
    filters,
    setFilters,

    // Selection
    selectedIds,
    toggleSelection,
    selectAllPending,
    clearSelection,

    // Actions
    launchSelected,
    launchSingle,
    getPreventiveDetail,
    refresh: fetchScheduledPreventives,

    // Loading states
    isLoading,
    isLaunching,
    error,
  };
};

export default useScheduledPreventives;
