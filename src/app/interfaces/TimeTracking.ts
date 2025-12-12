import { BaseModel } from './BaseModel';

/**
 * Representa un registro de fichaje de un operario
 */
export interface TimeTracking extends BaseModel {
  operatorId: string;
  operatorName: string;
  startDateTime: Date;
  endDateTime?: Date;
  comments?: string;
}

/**
 * Request para crear un nuevo fichaje
 */
export interface TimeTrackingCreateRequest {
  operatorId: string;
  startDateTime: Date;
  endDateTime?: Date;
  comments?: string;
}

/**
 * Request para actualizar un fichaje existente
 */
export interface TimeTrackingUpdateRequest {
  id: string;
  startDateTime: Date;
  endDateTime?: Date;
  comments?: string;
}

/**
 * Request para listar fichajes con filtros básicos
 */
export interface TimeTrackingListRequest {
  operatorId?: string;
  startDate?: Date;
  endDate?: Date;
  onlyOpen?: boolean;
}

/**
 * Request para búsqueda avanzada de fichajes
 */
export interface TimeTrackingSearchRequest {
  operatorId?: string;
  startDate?: Date;
  endDate?: Date;
  onlyOpen?: boolean;
  minHours?: number;
  maxHours?: number;
}

/**
 * Request para fichar entrada
 */
export interface ClockInRequest {
  operatorId: string;
  startDateTime?: Date;
  comments?: string;
}

/**
 * Request para fichar salida
 */
export interface ClockOutRequest {
  operatorId: string;
  endDateTime?: Date;
  comments?: string;
}

/**
 * Resumen diario de horas trabajadas por operario
 */
export interface TimeTrackingSummary {
  operatorId: string;
  operatorName: string;
  date: Date;
  totalHours: number;
  numberOfEntries: number;
}

/**
 * Calcula las horas trabajadas de un fichaje
 */
export const calculateWorkedHours = (timeTracking: TimeTracking): number => {
  if (!timeTracking.endDateTime) return 0;

  const start = new Date(timeTracking.startDateTime);
  const end = new Date(timeTracking.endDateTime);
  const diff = end.getTime() - start.getTime();
  const hours = diff / (1000 * 60 * 60);

  return Math.round(hours * 100) / 100;
};

/**
 * Verifica si un fichaje está abierto (sin hora de salida)
 */
export const isTimeTrackingOpen = (timeTracking: TimeTracking): boolean => {
  return !timeTracking.endDateTime;
};
