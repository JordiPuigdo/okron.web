import {
  Holiday,
  HolidayCreateRequest,
  HolidayUpdateRequest,
} from '../interfaces/Holiday';

export class HolidayService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getAll(): Promise<Holiday[]> {
    const response = await fetch(`${this.baseUrl}holidays`);

    if (!response.ok) {
      throw new Error('Failed to fetch holidays');
    }

    return response.json();
  }

  async getByYear(year: number): Promise<Holiday[]> {
    const response = await fetch(`${this.baseUrl}holidays/year/${year}`);

    if (!response.ok) {
      throw new Error('Failed to fetch holidays by year');
    }

    return response.json();
  }

  async getById(id: string): Promise<Holiday> {
    const response = await fetch(`${this.baseUrl}holidays/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch holiday');
    }

    return response.json();
  }

  async create(holidayData: HolidayCreateRequest): Promise<Holiday> {
    const response = await fetch(`${this.baseUrl}holidays`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(holidayData),
    });

    if (!response.ok) {
      throw new Error('Failed to create holiday');
    }

    return response.json();
  }

  async update(holidayData: HolidayUpdateRequest): Promise<Holiday> {
    const response = await fetch(`${this.baseUrl}holidays/${holidayData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(holidayData),
    });

    if (!response.ok) {
      throw new Error('Failed to update holiday');
    }

    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}holidays/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete holiday');
    }
  }
}
