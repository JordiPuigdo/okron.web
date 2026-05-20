import {
  ApprovalRequestDto,
  CreateVacationRequestDto,
  RejectionRequestDto,
  VacationBalance,
  VacationRequest,
  VacationRequestSummary,
  VacationStatus,
  VacationType,
} from '../interfaces/Vacation';

export class VacationService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getVacationBalance(operatorId: string, year?: number): Promise<VacationBalance> {
    try {
      const currentYear = year ?? new Date().getFullYear();
      const response = await fetch(
        `${this.baseUrl}vacation-request/operator/${operatorId}/balance/${currentYear}`
      );

      if (!response.ok) throw new Error('Failed to fetch vacation balance');

      const data = await response.json();

      return {
        operatorId,
        totalHours: data.totalHours ?? 0,
        usedHours: data.usedHours ?? 0,
        availableHours: data.availableHours ?? 0,
        workingHoursPerDay: data.workingHoursPerDay ?? 8,
        totalDays: data.totalDays ?? 0,
        usedDays: data.usedDays ?? 0,
        availableDays: data.availableDays ?? 0,
      };
    } catch (error) {
      console.error('Error fetching vacation balance:', error);
      throw error;
    }
  }

  async getVacationRequests(operatorId: string): Promise<VacationRequest[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}vacation-request/operator/${operatorId}`
      );

      if (!response.ok) throw new Error('Failed to fetch vacation requests');
      if (response.status === 204) return [];

      const data = await response.json();
      return (data as Array<Partial<VacationRequest>>).map(item => this.mapVacationRequest(item));
    } catch (error) {
      console.error('Error fetching vacation requests:', error);
      throw error;
    }
  }

  async getPendingRequests(): Promise<VacationRequest[]> {
    try {
      const response = await fetch(`${this.baseUrl}vacation-request/pending`);

      if (!response.ok) throw new Error('Failed to fetch pending requests');
      if (response.status === 204) return [];

      const data = await response.json();
      return (data as Array<Partial<VacationRequest>>).map(item => this.mapVacationRequest(item));
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }
  }

  async createVacationRequest(dto: CreateVacationRequestDto): Promise<VacationRequest> {
    try {
      const requestBody = {
        operatorId: dto.operatorId,
        startDate: dto.startDate.toISOString(),
        endDate: dto.endDate.toISOString(),
        reason: dto.reason ?? '',
        status: VacationStatus.Pending,
        vacationType: dto.vacationType,
        startTime: dto.startTime ?? null,
        endTime: dto.endTime ?? null,
      };

      const response = await fetch(`${this.baseUrl}vacation-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error('Failed to create vacation request');

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        return this.mapVacationRequest(data);
      }

      return {
        id: '',
        operatorId: dto.operatorId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        reason: dto.reason ?? '',
        status: VacationStatus.Pending,
        vacationType: dto.vacationType,
        totalDays: 0,
        totalHours: 0,
        startTime: dto.startTime,
        endTime: dto.endTime,
        active: true,
        creationDate: new Date(),
      } as VacationRequest;
    } catch (error) {
      console.error('Error creating vacation request:', error);
      throw error;
    }
  }

  async approveVacationRequest(id: string, dto: ApprovalRequestDto): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}vacation-request/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });

      if (!response.ok) throw new Error('Failed to approve vacation request');
      return true;
    } catch (error) {
      console.error('Error approving vacation request:', error);
      throw error;
    }
  }

  async rejectVacationRequest(id: string, dto: RejectionRequestDto): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}vacation-request/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });

      if (!response.ok) throw new Error('Failed to reject vacation request');
      return true;
    } catch (error) {
      console.error('Error rejecting vacation request:', error);
      throw error;
    }
  }

  async cancelVacationRequest(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}vacation-request/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to cancel vacation request');
      return true;
    } catch (error) {
      console.error('Error cancelling vacation request:', error);
      throw error;
    }
  }

  async reactivateVacationRequest(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}vacation-request/${id}/reactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to reactivate vacation request');
      return true;
    } catch (error) {
      console.error('Error reactivating vacation request:', error);
      throw error;
    }
  }

  async deleteVacationRequest(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}vacation-request/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to delete vacation request');
      return true;
    } catch (error) {
      console.error('Error deleting vacation request:', error);
      throw error;
    }
  }

  async getVacationSummary(
    startDate: Date,
    endDate: Date,
    operatorId?: string
  ): Promise<VacationRequestSummary[]> {
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      if (operatorId) params.append('operatorId', operatorId);

      const response = await fetch(
        `${this.baseUrl}vacation-request/summary?${params.toString()}`
      );

      if (!response.ok) throw new Error('Failed to fetch vacation summary');
      if (response.status === 204) return [];

      const data = await response.json();
      return (data as Array<Partial<VacationRequestSummary>>).map(item => ({
        operatorId: item.operatorId ?? '',
        operatorName: item.operatorName ?? '',
        startDate: new Date(item.startDate!),
        endDate: new Date(item.endDate!),
        workingDays: item.workingDays ?? 0,
        totalHours: item.totalHours ?? 0,
        vacationType: item.vacationType ?? VacationType.FullDay,
        workingHoursPerDay: item.workingHoursPerDay ?? 8,
        status: item.status ?? VacationStatus.Pending,
        reason: item.reason ?? '',
      } as VacationRequestSummary));
    } catch (error) {
      console.error('Error fetching vacation summary:', error);
      throw error;
    }
  }

  validateVacationRequest(dto: CreateVacationRequestDto): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (isNaN(dto.startDate.getTime()) || isNaN(dto.endDate.getTime())) {
      errors.push('Les dates no són vàlides');
    }

    if (dto.vacationType === VacationType.FullDay) {
      if (dto.endDate < dto.startDate) {
        errors.push('La data de fi ha de ser posterior a la data d\'inici');
      }
    }

    if (dto.vacationType === VacationType.Hours) {
      const day = dto.startDate.getDay();
      if (day === 0 || day === 6) {
        errors.push('No pots sol·licitar hores en cap de setmana');
      }
      if (dto.startTime && dto.endTime && dto.startTime >= dto.endTime) {
        errors.push('L\'hora de fi ha de ser posterior a la d\'inici');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  calculateVacationDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  calculateVacationHours(startTime: string, endTime: string): number {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    return (endH * 60 + endM - (startH * 60 + startM)) / 60;
  }

  private mapVacationRequest(item: Partial<VacationRequest>): VacationRequest {
    return {
      ...item,
      startDate: new Date(item.startDate!),
      endDate: new Date(item.endDate!),
      creationDate: item.creationDate ? new Date(item.creationDate) : undefined,
      approvedDate: item.approvedDate ? new Date(item.approvedDate) : undefined,
      totalDays: item.totalDays ?? 0,
      totalHours: item.totalHours ?? 0,
      vacationType: item.vacationType ?? VacationType.FullDay,
    } as VacationRequest;
  }
}
