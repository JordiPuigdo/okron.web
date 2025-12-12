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

/**
 * Service para gestionar fichajes de operarios
 * Implementa Single Responsibility Principle - solo maneja comunicación con API
 */
export class TimeTrackingService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = `${baseUrl}TimeTracking`;
  }

  /**
   * Crea un nuevo fichaje
   */
  async create(request: TimeTrackingCreateRequest): Promise<TimeTracking> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to create time tracking');
    }

    return response.json();
  }

  /**
   * Actualiza un fichaje existente
   */
  async update(
    id: string,
    request: TimeTrackingUpdateRequest
  ): Promise<TimeTracking> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to update time tracking');
    }

    return response.json();
  }

  /**
   * Obtiene un fichaje por ID
   */
  async getById(id: string): Promise<TimeTracking> {
    const response = await fetch(`${this.baseUrl}/${id}`);

    if (!response.ok) {
      throw new Error('Failed to get time tracking');
    }

    return response.json();
  }

  /**
   * Lista fichajes con filtros básicos
   */
  async getList(request: TimeTrackingListRequest): Promise<TimeTracking[]> {
    const params = new URLSearchParams();

    if (request.operatorId) params.append('operatorId', request.operatorId);
    if (request.startDate)
      params.append('startDate', request.startDate.toISOString());
    if (request.endDate)
      params.append('endDate', request.endDate.toISOString());
    if (request.onlyOpen !== undefined)
      params.append('onlyOpen', request.onlyOpen.toString());

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to get time tracking list');
    }

    return response.json();
  }

  /**
   * Búsqueda avanzada de fichajes
   */
  async search(request: TimeTrackingSearchRequest): Promise<TimeTracking[]> {
    const params = new URLSearchParams();

    if (request.operatorId) params.append('operatorId', request.operatorId);
    if (request.startDate)
      params.append('startDate', request.startDate.toISOString());
    if (request.endDate)
      params.append('endDate', request.endDate.toISOString());
    if (request.onlyOpen !== undefined)
      params.append('onlyOpen', request.onlyOpen.toString());
    if (request.minHours !== undefined)
      params.append('minHours', request.minHours.toString());
    if (request.maxHours !== undefined)
      params.append('maxHours', request.maxHours.toString());

    const response = await fetch(`${this.baseUrl}/search?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to search time trackings');
    }

    return response.json();
  }

  /**
   * Elimina un fichaje
   */
  async delete(id: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete time tracking');
    }

    return response.json();
  }

  /**
   * Fichar entrada
   */
  async clockIn(request: ClockInRequest): Promise<TimeTracking> {
    const response = await fetch(`${this.baseUrl}/clock-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to clock in');
    }

    return response.json();
  }

  /**
   * Fichar salida
   */
  async clockOut(request: ClockOutRequest): Promise<TimeTracking> {
    const response = await fetch(`${this.baseUrl}/clock-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to clock out');
    }

    return response.json();
  }

  /**
   * Obtiene el fichaje abierto de un operario
   */
  async getOpenTimeTracking(operatorId: string): Promise<TimeTracking | null> {
    const response = await fetch(`${this.baseUrl}/open/${operatorId}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to get open time tracking');
    }

    return response.json();
  }

  /**
   * Obtiene resumen diario de horas trabajadas
   */
  async getDailySummary(
    operatorId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TimeTrackingSummary[]> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const response = await fetch(
      `${this.baseUrl}/summary/${operatorId}?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to get daily summary');
    }

    return response.json();
  }
}

export const timeTrackingService = new TimeTrackingService(
  process.env.NEXT_PUBLIC_API_BASE_URL || ''
);
