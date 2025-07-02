import { Rate, RateType } from 'app/interfaces/Rate';

export class RateService {
  private readonly baseUrl: string;

  constructor(
    baseUrl: string = `${process.env.NEXT_PUBLIC_API_BASE_URL}rates`
  ) {
    this.baseUrl = baseUrl;
  }

  async getAll(): Promise<Rate[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) throw new Error('Error fetching rates');
    return res.json();
  }

  async getById(id: string): Promise<Rate> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (!res.ok) throw new Error('Error fetching rate');
    return res.json();
  }

  async create(data: Omit<Rate, 'id'>): Promise<Rate> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error creating rate');
    return res.json();
  }

  async update(id: string, data: Partial<Rate>): Promise<Rate> {
    const res = await fetch(`${this.baseUrl}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error updating rate');
    return data as Rate;
  }

  async remove(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error deleting rate');
  }

  async getAllTypes(): Promise<RateType[]> {
    const res = await fetch(`${this.baseUrl}/types`);
    if (!res.ok) throw new Error('Error fetching rate types');
    return res.json();
  }

  async getTypeById(id: string): Promise<RateType> {
    const res = await fetch(`${this.baseUrl}/types/${id}`);
    if (!res.ok) throw new Error('Error fetching rate type');
    return res.json();
  }

  async createType(data: Omit<RateType, 'id'>): Promise<RateType> {
    const res = await fetch(`${this.baseUrl}/types`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error creating rate type');
    return res.json();
  }

  async updateType(data: RateType): Promise<RateType> {
    const res = await fetch(`${this.baseUrl}/types`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error updating rate type');
    return res.json();
  }

  async removeType(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/types/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error deleting rate type');
  }
}
