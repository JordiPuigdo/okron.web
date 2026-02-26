import {
  Budget,
  BudgetVersion,
  BudgetVersionSummary,
  CreateBudgetVersionRequest,
  RestoreBudgetVersionRequest,
} from '../interfaces/Budget';

export class BudgetVersionService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    path: string,
    options?: RequestInit,
    errorMessage = 'Request failed'
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!response.ok) {
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async createVersion(
    request: CreateBudgetVersionRequest
  ): Promise<BudgetVersion> {
    return this.request<BudgetVersion>('budgets/versions', {
      method: 'POST',
      body: JSON.stringify(request),
    }, 'Failed to create budget version');
  }

  async getVersionsByBudgetId(
    budgetId: string
  ): Promise<BudgetVersionSummary[]> {
    return this.request<BudgetVersionSummary[]>(
      `budgets/versions/budget/${budgetId}`,
      { method: 'GET' },
      'Failed to fetch budget versions'
    );
  }

  async getVersionById(versionId: string): Promise<BudgetVersion> {
    return this.request<BudgetVersion>(
      `budgets/versions/${versionId}`,
      { method: 'GET' },
      'Failed to fetch budget version'
    );
  }

  async restoreVersion(request: RestoreBudgetVersionRequest): Promise<Budget> {
    return this.request<Budget>('budgets/versions/restore', {
      method: 'POST',
      body: JSON.stringify(request),
    }, 'Failed to restore budget version');
  }
}
