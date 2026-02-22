import {
  CreditNote,
  CreditNoteCreationRequest,
  CreditNoteListRequest,
  CreditNoteSearchFilters,
  CreditNoteUpdateRequest,
} from '../interfaces/CreditNote';

export class CreditNoteService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getAll(filters?: CreditNoteListRequest): Promise<CreditNote[]> {
    const queryParams = new URLSearchParams();

    if (filters?.startDate) {
      queryParams.append('startDate', new Date(filters.startDate).toISOString());
    }
    if (filters?.endDate) {
      queryParams.append('endDate', new Date(filters.endDate).toISOString());
    }
    if (filters?.companyName) {
      queryParams.append('companyName', filters.companyName);
    }
    if (filters?.originalInvoiceId) {
      queryParams.append('originalInvoiceId', filters.originalInvoiceId);
    }
    if (filters?.type !== undefined) {
      queryParams.append('type', filters.type.toString());
    }

    const response = await fetch(
      `${this.baseUrl}credit-notes?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch credit notes');
    }

    return response.json();
  }

  async getById(id: string): Promise<CreditNote> {
    const response = await fetch(`${this.baseUrl}credit-notes/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch credit note');
    }

    return response.json();
  }

  async create(request: CreditNoteCreationRequest): Promise<CreditNote> {
    const response = await fetch(`${this.baseUrl}credit-notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to create credit note');
    }

    return response.json();
  }

  async update(request: CreditNoteUpdateRequest): Promise<CreditNote> {
    const response = await fetch(`${this.baseUrl}credit-notes`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to update credit note');
    }

    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}credit-notes/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete credit note');
    }
  }

  async generateCode(): Promise<string> {
    const response = await fetch(`${this.baseUrl}credit-notes/generate-code`);

    if (!response.ok) {
      throw new Error('Failed to generate credit note code');
    }

    const data = await response.json();
    return data.code;
  }

  async searchCreditNotes(
    filters: CreditNoteSearchFilters
  ): Promise<CreditNote[]> {
    const response = await fetch(`${this.baseUrl}GetCreditNotesWithFilters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      throw new Error('Failed to search credit notes');
    }

    return response.json();
  }
}
