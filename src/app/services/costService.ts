import {
  CostCenter,
  CreateCostCenterRequest,
  UpdateCostCenterRequest,
} from 'app/interfaces/CostCenter';

export class CostService {
  baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;

  async getAll(): Promise<CostCenter[]> {
    const url = `${this.baseUrl}costCenter`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  }

  async getById(id: string): Promise<CostCenter> {
    const url = `${this.baseUrl}costCenter/${id}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  }

  async create(costCenter: CreateCostCenterRequest): Promise<CostCenter> {
    const url = `${this.baseUrl}costCenter`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(costCenter),
    });
    return await response.json();
  }

  async update(costCenter: UpdateCostCenterRequest): Promise<void> {
    const url = `${this.baseUrl}costCenter/${costCenter.id}`;
    await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(costCenter),
    });
  }

  async delete(id: string): Promise<void> {
    const url = `${this.baseUrl}costCenter/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  }
}
