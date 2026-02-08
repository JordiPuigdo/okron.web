import {
  Family,
  CreateFamilyRequest,
  UpdateFamilyRequest,
  GenerateCodeResponse,
} from 'app/interfaces/Family';

export class FamilyService {
  private readonly baseUrl: string;

  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL! + 'family'
  ) {
    this.baseUrl = baseUrl;
  }

  async getAll(): Promise<Family[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) throw new Error('Error fetching families');
    return res.json();
  }

  async getById(id: string): Promise<Family> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (!res.ok) throw new Error('Error fetching family');
    return res.json();
  }

  async getByParentId(parentId: string): Promise<Family[]> {
    const res = await fetch(`${this.baseUrl}/parent/${parentId}`);
    if (!res.ok) throw new Error('Error fetching subfamilies');
    return res.json();
  }

  async create(data: CreateFamilyRequest): Promise<Family> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Error creating family');
    return res.json();
  }

  async update(data: UpdateFamilyRequest): Promise<boolean> {
    const res = await fetch(this.baseUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Error updating family');
    return res.ok;
  }

  async remove(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error deleting family');
  }

  async toggleActive(id: string, active: boolean): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}/active`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(active),
    });
    if (!res.ok) throw new Error('Error toggling family active state');
  }

  async generateCode(id: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/${id}/generate-code`, {
      method: 'POST',
    });

    if (!res.ok) throw new Error('Error generating family code');
    const response: GenerateCodeResponse = await res.json();
    return response.code;
  }
}
