import {
  AddAssemblyArticleRequest,
  AddAssemblyFolderRequest,
  AssemblyBudgetCreationRequest,
  Budget,
  MoveAssemblyNodeRequest,
  RemoveAssemblyNodeRequest,
  UpdateAssemblyBudgetRequest,
  UpdateAssemblyNodeRequest,
} from '../interfaces/Budget';

export class BudgetAssemblyService {
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

  async getById(id: string): Promise<Budget> {
    return this.request<Budget>(`budgets/${id}`, { method: 'GET' });
  }

  async create(request: AssemblyBudgetCreationRequest): Promise<Budget> {
    return this.request<Budget>('budgets/assembly', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async update(request: UpdateAssemblyBudgetRequest): Promise<Budget> {
    return this.request<Budget>('budgets/assembly', {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async addFolder(request: AddAssemblyFolderRequest): Promise<Budget> {
    return this.request<Budget>('budgets/assembly/folder', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async addArticle(request: AddAssemblyArticleRequest): Promise<Budget> {
    return this.request<Budget>('budgets/assembly/article', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async moveNode(request: MoveAssemblyNodeRequest): Promise<Budget> {
    return this.request<Budget>('budgets/assembly/move-node', {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async removeNode(request: RemoveAssemblyNodeRequest): Promise<Budget> {
    return this.request<Budget>('budgets/assembly/node', {
      method: 'DELETE',
      body: JSON.stringify(request),
    });
  }

  async updateNode(request: UpdateAssemblyNodeRequest): Promise<Budget> {
    return this.request<Budget>('budgets/assembly/node', {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async recalculateTotals(budgetId: string): Promise<Budget> {
    return this.request<Budget>(
      `budgets/assembly/${budgetId}/recalculate`,
      { method: 'POST' }
    );
  }
}
