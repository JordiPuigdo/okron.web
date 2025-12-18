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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || errorData.title || 'Failed to create holiday'
      );
    }

    // El backend puede devolver texto o JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    // Si devuelve texto, retornamos el holiday creado con los datos enviados
    return {
      id: '', // El ID se obtendrá al refrescar la tabla
      ...holidayData,
    } as Holiday;
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || errorData.title || 'Failed to update holiday'
      );
    }

    // El backend puede devolver texto o JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    // Si devuelve texto, retornamos el holiday con los datos actualizados
    return holidayData as Holiday;
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
