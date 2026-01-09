import {
  ApprovalRequestDto,
  CreateVacationRequestDto,
  RejectionRequestDto,
  VacationBalance,
  VacationRequest,
  VacationRequestSummary,
  VacationStatus,
} from '../interfaces/Vacation';

export class VacationService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get vacation balance for an operator
   */
  async getVacationBalance(
    operatorId: string,
    year?: number
  ): Promise<VacationBalance> {
    try {
      const currentYear = year || new Date().getFullYear();
      const [availableResponse, usedResponse] = await Promise.all([
        fetch(
          `${this.baseUrl}vacation-request/operator/${operatorId}/available-days/${currentYear}`
        ),
        fetch(
          `${this.baseUrl}vacation-request/operator/${operatorId}/used-days/${currentYear}`
        ),
      ]);

      if (!availableResponse.ok || !usedResponse.ok) {
        throw new Error('Failed to fetch vacation balance');
      }

      const availableData = await availableResponse.json();
      const usedData = await usedResponse.json();

      const availableDays = availableData.availableDays || 0;
      const usedDays = usedData.usedDays || 0;

      return {
        operatorId,
        availableDays,
        usedDays,
      };
    } catch (error) {
      console.error('Error fetching vacation balance:', error);
      throw error;
    }
  }

  /**
   * Get all vacation requests for an operator
   */
  async getVacationRequests(operatorId: string): Promise<VacationRequest[]> {
    try {
      const url = `${this.baseUrl}vacation-request/operator/${operatorId}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch vacation requests');
      }

      if (response.status === 204) {
        return [];
      }

      const data = await response.json();

      return (data as Array<Partial<VacationRequest>>).map(
        item =>
          ({
            ...item,
            startDate: new Date(item.startDate!),
            endDate: new Date(item.endDate!),
            creationDate: item.creationDate
              ? new Date(item.creationDate)
              : undefined,
            approvedDate: item.approvedDate
              ? new Date(item.approvedDate)
              : undefined,
            totalDays: this.calculateVacationDays(
              new Date(item.startDate!),
              new Date(item.endDate!)
            ),
          } as VacationRequest)
      );
    } catch (error) {
      console.error('Error fetching vacation requests:', error);
      throw error;
    }
  }

  /**
   * Get pending vacation requests (for admin/manager view)
   */
  async getPendingRequests(): Promise<VacationRequest[]> {
    try {
      const response = await fetch(`${this.baseUrl}vacation-request/pending`);

      if (!response.ok) {
        throw new Error('Failed to fetch pending requests');
      }

      if (response.status === 204) {
        return [];
      }

      const data = await response.json();

      return (data as Array<Partial<VacationRequest>>).map(
        item =>
          ({
            ...item,
            startDate: new Date(item.startDate!),
            endDate: new Date(item.endDate!),
            creationDate: item.creationDate
              ? new Date(item.creationDate)
              : undefined,
            approvedDate: item.approvedDate
              ? new Date(item.approvedDate)
              : undefined,
            totalDays: this.calculateVacationDays(
              new Date(item.startDate!),
              new Date(item.endDate!)
            ),
          } as VacationRequest)
      );
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }
  }

  /**
   * Create a new vacation request
   */
  async createVacationRequest(
    dto: CreateVacationRequestDto
  ): Promise<VacationRequest> {
    try {
      const requestBody = {
        operatorId: dto.operatorId,
        startDate: dto.startDate.toISOString(),
        endDate: dto.endDate.toISOString(),
        reason: dto.reason || '',
        status: VacationStatus.Pending,
      };

      const response = await fetch(`${this.baseUrl}vacation-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to create vacation request');
      }

      // La API puede devolver texto o JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return {
          ...data,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          totalDays: this.calculateVacationDays(
            new Date(data.startDate),
            new Date(data.endDate)
          ),
        };
      }

      // Si devuelve texto, retornamos el request con los datos enviados
      return {
        id: '',
        operatorId: dto.operatorId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        reason: dto.reason || '',
        status: VacationStatus.Pending,
        totalDays: this.calculateVacationDays(dto.startDate, dto.endDate),
      } as VacationRequest;
    } catch (error) {
      console.error('Error creating vacation request:', error);
      throw error;
    }
  }

  /**
   * Approve vacation request
   */
  async approveVacationRequest(
    id: string,
    dto: ApprovalRequestDto
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}vacation-request/${id}/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dto),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to approve vacation request');
      }

      return true;
    } catch (error) {
      console.error('Error approving vacation request:', error);
      throw error;
    }
  }

  /**
   * Reject vacation request
   */
  async rejectVacationRequest(
    id: string,
    dto: RejectionRequestDto
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}vacation-request/${id}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dto),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reject vacation request');
      }

      return true;
    } catch (error) {
      console.error('Error rejecting vacation request:', error);
      throw error;
    }
  }

  /**
   * Cancel vacation request
   */
  async cancelVacationRequest(id: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}vacation-request/${id}/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel vacation request');
      }

      return true;
    } catch (error) {
      console.error('Error cancelling vacation request:', error);
      throw error;
    }
  }

  /**
   * Reactivate a cancelled vacation request
   */
  async reactivateVacationRequest(id: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}vacation-request/${id}/reactivate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reactivate vacation request');
      }

      return true;
    } catch (error) {
      console.error('Error reactivating vacation request:', error);
      throw error;
    }
  }

  /**
   * Delete a vacation request
   */
  async deleteVacationRequest(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}vacation-request/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete vacation request');
      }

      return true;
    } catch (error) {
      console.error('Error deleting vacation request:', error);
      throw error;
    }
  }

  /**
   * Get vacation summary by date range
   */
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

      if (operatorId) {
        params.append('operatorId', operatorId);
      }

      const response = await fetch(
        `${this.baseUrl}vacation-request/summary?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch vacation summary');
      }

      if (response.status === 204) {
        return [];
      }

      const data = await response.json();

      return (data as Array<Partial<VacationRequestSummary>>).map(
        item =>
          ({
            operatorId: item.operatorId,
            operatorName: item.operatorName,
            startDate: new Date(item.startDate!),
            endDate: new Date(item.endDate!),
            workingDays: item.workingDays,
            status: item.status,
            reason: item.reason,
          } as VacationRequestSummary)
      );
    } catch (error) {
      console.error('Error fetching vacation summary:', error);
      throw error;
    }
  }

  /**
   * Validate vacation request dates
   */
  validateVacationRequest(dto: CreateVacationRequestDto): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (dto.endDate < dto.startDate) {
      errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    if (isNaN(dto.startDate.getTime()) || isNaN(dto.endDate.getTime())) {
      errors.push('Las fechas no son válidas');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate number of vacation days between two dates
   * Excludes weekends
   */
  calculateVacationDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      // Count only weekdays (Monday to Friday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }
}
