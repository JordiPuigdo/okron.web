import {
  AddAssemblyArticleRequest,
  AddAssemblyFolderRequest,
  AssemblyBudgetCreationRequest,
  Budget,
  ImportAssemblyNodesRequest,
  MoveAssemblyNodeRequest,
  RemoveAssemblyNodeRequest,
  ReorganizeAssemblyNodesRequest,
  UpdateAssemblyBudgetRequest,
  UpdateAssemblyMarginRequest,
  UpdateAssemblyNodeRequest,
  UpdateAssemblyNodesMarginRequest,
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
    const normalizedRequest: AddAssemblyFolderRequest = {
      ...request,
      parentNodeId:
        typeof request.parentNodeId === 'string' &&
        request.parentNodeId.trim() === ''
          ? undefined
          : request.parentNodeId,
    };

    return this.request<Budget>('budgets/assembly/folder', {
      method: 'POST',
      body: JSON.stringify(normalizedRequest),
    });
  }

  async addArticle(request: AddAssemblyArticleRequest): Promise<Budget> {
    const normalizedRequest: AddAssemblyArticleRequest = {
      ...request,
      parentNodeId:
        typeof request.parentNodeId === 'string' &&
        request.parentNodeId.trim() === ''
          ? undefined
          : request.parentNodeId,
    };

    return this.request<Budget>('budgets/assembly/article', {
      method: 'POST',
      body: JSON.stringify(normalizedRequest),
    });
  }

  async moveNode(request: MoveAssemblyNodeRequest): Promise<Budget> {
    const normalizedRequest: MoveAssemblyNodeRequest = {
      ...request,
      newParentNodeId:
        typeof request.newParentNodeId === 'string' &&
        request.newParentNodeId.trim() === ''
          ? null
          : request.newParentNodeId,
    };

    return this.request<Budget>('budgets/assembly/move-node', {
      method: 'PUT',
      body: JSON.stringify(normalizedRequest),
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

  async updateMargin(request: UpdateAssemblyMarginRequest): Promise<Budget> {
    return this.request<Budget>(
      `budgets/assembly/${request.budgetId}/margin`,
      {
        method: 'PUT',
        body: JSON.stringify(request),
      }
    );
  }

  async updateNodesMargin(
    request: UpdateAssemblyNodesMarginRequest
  ): Promise<Budget> {
    return this.request<Budget>('budgets/assembly/nodes-margin', {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async reorganizeNodes(
    request: ReorganizeAssemblyNodesRequest
  ): Promise<Budget> {
    return this.request<Budget>('budgets/assembly/reorganize-nodes', {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async importNodes(request: ImportAssemblyNodesRequest): Promise<Budget> {
    return this.request<Budget>(
      `budgets/assembly/${request.budgetId}/import-nodes`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }
}
