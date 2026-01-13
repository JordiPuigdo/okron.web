import {
  Budget,
  BudgetCreationRequest,
  BudgetSearchFilters,
  BudgetUpdateRequest,
  ConvertBudgetToDeliveryNoteRequest,
} from '../interfaces/Budget';
import { DeliveryNote } from '../interfaces/DeliveryNote';

export class BudgetService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getAll(filters?: BudgetSearchFilters): Promise<Budget[]> {
    const queryParams = new URLSearchParams();

    if (filters?.startDate) {
      const startDate = new Date(filters.startDate);
      const formattedStart = `${startDate.getFullYear()}-${String(
        startDate.getMonth() + 1
      ).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
      queryParams.append('startDate', formattedStart);
    }
    if (filters?.endDate) {
      const endDate = new Date(filters.endDate);
      const formattedEnd = `${endDate.getFullYear()}-${String(
        endDate.getMonth() + 1
      ).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      queryParams.append('endDate', formattedEnd);
    }
    if (filters?.customerId) {
      queryParams.append('customerId', filters.customerId);
    }
    if (filters?.status !== undefined) {
      queryParams.append('status', filters.status.toString());
    }
    if (filters?.companyName) {
      queryParams.append('companyName', filters.companyName);
    }
    if (filters?.budgetCode) {
      queryParams.append('budgetCode', filters.budgetCode);
    }
    if (filters?.minAmount !== undefined) {
      queryParams.append('minAmount', filters.minAmount.toString());
    }
    if (filters?.maxAmount !== undefined) {
      queryParams.append('maxAmount', filters.maxAmount.toString());
    }
    if (filters?.workOrderId) {
      queryParams.append('workOrderId', filters.workOrderId);
    }
    if (filters?.hasDeliveryNote !== undefined) {
      queryParams.append('hasDeliveryNote', filters.hasDeliveryNote.toString());
    }

    const response = await fetch(
      `${this.baseUrl}budgets?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch budgets');
    }

    return response.json();
  }

  async getById(id: string): Promise<Budget> {
    const response = await fetch(`${this.baseUrl}budgets/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch budget');
    }

    return response.json();
  }

  async create(budgetData: BudgetCreationRequest): Promise<Budget> {
    const response = await fetch(`${this.baseUrl}budgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(budgetData),
    });

    if (!response.ok) {
      throw new Error('Failed to create budget');
    }

    return response.json();
  }

  async update(budgetData: BudgetUpdateRequest): Promise<Budget> {
    const response = await fetch(`${this.baseUrl}budgets/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(budgetData),
    });

    if (!response.ok) {
      throw new Error('Failed to update budget');
    }

    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}budgets/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete budget');
    }
  }

  async convertToDeliveryNote(
    request: ConvertBudgetToDeliveryNoteRequest
  ): Promise<DeliveryNote> {
    const response = await fetch(
      `${this.baseUrl}budgets/convert-to-delivery-note`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to convert budget to delivery note');
    }

    return response.json();
  }
}
