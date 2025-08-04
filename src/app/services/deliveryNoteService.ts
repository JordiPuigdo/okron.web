import { DeliveryNote, DeliveryNoteCreateRequest, DeliveryNoteUpdateRequest } from '../interfaces';

export class DeliveryNoteService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getAll(filters?: any): Promise<DeliveryNote[]> {
    const queryParams = new URLSearchParams();

    if (filters?.startDate) {
      queryParams.append('startDate', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      queryParams.append('endDate', filters.endDate.toISOString());
    }
    if (filters?.companyName) {
      queryParams.append('companyName', filters.companyName);
    }
    if (filters?.status !== undefined) {
      queryParams.append('status', filters.status.toString());
    }

    const response = await fetch(`${this.baseUrl}deliverynotes?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch delivery notes');
    }

    return response.json();
  }

  async getById(id: string): Promise<DeliveryNote> {
    const response = await fetch(`${this.baseUrl}deliverynotes/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch delivery note');
    }

    return response.json();
  }

  async create(deliveryNoteData: DeliveryNoteCreateRequest): Promise<DeliveryNote> {
    const response = await fetch(`${this.baseUrl}deliverynotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deliveryNoteData),
    });

    if (!response.ok) {
      throw new Error('Failed to create delivery note');
    }

    return response.json();
  }

  async update(deliveryNoteData: DeliveryNoteUpdateRequest): Promise<DeliveryNote> {
    const response = await fetch(`${this.baseUrl}deliverynotes`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deliveryNoteData),
    });

    if (!response.ok) {
      throw new Error('Failed to update delivery note');
    }

    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}deliverynotes/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete delivery note');
    }
  }

  async generateCode(): Promise<{ code: string }> {
    const response = await fetch(`${this.baseUrl}deliverynotes/generate-code`);

    if (!response.ok) {
      throw new Error('Failed to generate delivery note code');
    }

    return response.json();
  }
}