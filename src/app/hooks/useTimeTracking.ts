import { useEffect, useState } from 'react';
import {
  ClockInRequest,
  ClockOutRequest,
  TimeTracking,
  TimeTrackingCreateRequest,
  TimeTrackingListRequest,
  TimeTrackingSearchRequest,
  TimeTrackingSummary,
  TimeTrackingUpdateRequest,
} from 'app/interfaces/TimeTracking';
import { timeTrackingService } from 'app/services/timeTrackingService';

/**
 * Hook para gestionar fichajes
 * Implementa Separation of Concerns - lógica de negocio separada del servicio HTTP
 */
export const useTimeTracking = (operatorId?: string) => {
  const [timeTrackings, setTimeTrackings] = useState<TimeTracking[]>([]);
  const [currentTimeTracking, setCurrentTimeTracking] =
    useState<TimeTracking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Verifica si el operario tiene un fichaje abierto
   */
  const checkOpenTimeTracking = async (opId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const openTracking = await timeTrackingService.getOpenTimeTracking(opId);
      setCurrentTimeTracking(openTracking);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Carga fichajes con filtros
   */
  const fetchTimeTrackings = async (
    filters: TimeTrackingListRequest
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await timeTrackingService.getList(filters);
      setTimeTrackings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Búsqueda avanzada de fichajes
   */
  const searchTimeTrackings = async (
    filters: TimeTrackingSearchRequest
  ): Promise<TimeTracking[]> => {
    setIsLoading(true);
    setError(null);
    try {
      if (filters.operatorId == null && operatorId != null) {
        setTimeTrackings(
          timeTrackings.filter(tt => tt.operatorId === operatorId)
        );
        return timeTrackings.filter(tt => tt.operatorId === operatorId);
      }
      const data = await timeTrackingService.search(filters);
      setTimeTrackings(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fichar entrada
   */
  const clockIn = async (
    request: ClockInRequest
  ): Promise<TimeTracking | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const timeTracking = await timeTrackingService.clockIn(request);
      setCurrentTimeTracking(timeTracking);
      return timeTracking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al fichar entrada');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fichar salida
   */
  const clockOut = async (
    request: ClockOutRequest
  ): Promise<TimeTracking | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const timeTracking = await timeTrackingService.clockOut(request);
      setCurrentTimeTracking(null);
      return timeTracking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al fichar salida');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Crear fichaje manual
   */
  const createTimeTracking = async (
    request: TimeTrackingCreateRequest
  ): Promise<TimeTracking | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const timeTracking = await timeTrackingService.create(request);
      setTimeTrackings(prev => [...prev, timeTracking]);
      return timeTracking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear fichaje');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Actualizar fichaje
   */
  const updateTimeTracking = async (
    id: string,
    request: TimeTrackingUpdateRequest
  ): Promise<TimeTracking | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await timeTrackingService.update(id, request);
      setTimeTrackings(prev => prev.map(tt => (tt.id === id ? updated : tt)));
      return updated;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al actualizar fichaje'
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Eliminar fichaje
   */
  const deleteTimeTracking = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await timeTrackingService.delete(id);
      setTimeTrackings(prev => prev.filter(tt => tt.id !== id));
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al eliminar fichaje'
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Obtener resumen diario
   */
  const getDailySummary = async (
    opId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TimeTrackingSummary[]> => {
    setIsLoading(true);
    setError(null);
    try {
      return await timeTrackingService.getDailySummary(
        opId,
        startDate,
        endDate
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener resumen');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-check open time tracking on mount if operatorId provided
  useEffect(() => {
    if (operatorId) {
      checkOpenTimeTracking(operatorId);
    }
  }, [operatorId]);

  return {
    timeTrackings,
    currentTimeTracking,
    isLoading,
    error,
    checkOpenTimeTracking,
    fetchTimeTrackings,
    searchTimeTrackings,
    clockIn,
    clockOut,
    createTimeTracking,
    updateTimeTracking,
    deleteTimeTracking,
    getDailySummary,
  };
};
