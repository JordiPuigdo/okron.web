import { InvoiceCreationRequest, InvoiceDto, InvoiceItemCreationDto, InvoiceListRequest,InvoiceRateDto, UpdateInvoiceRequest } from '../interfaces/InvoiceInterfaces';

export default class InvoiceService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  async createInvoice(request: InvoiceCreationRequest): Promise<InvoiceDto> {
    const response = await this.fetchWithAuth('invoices', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async updateInvoice(request: UpdateInvoiceRequest): Promise<InvoiceDto> {
    const response = await this.fetchWithAuth('invoices', {
      method: 'PUT',
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async getInvoiceById(id: string): Promise<InvoiceDto> {
    const response = await this.fetchWithAuth(`invoices/${id}`);
    return response.json();
  }

  async getInvoices(filters?: InvoiceListRequest): Promise<InvoiceDto[]> {
    const queryParams = new URLSearchParams();
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.companyName) queryParams.append('companyName', filters.companyName);

    const url = `invoices${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.fetchWithAuth(url);
    return response.json();
  }

  async deleteInvoice(id: string): Promise<void> {
    await this.fetchWithAuth(`invoices/${id}`, {
      method: 'DELETE',
    });
  }

  async generateCode(): Promise<{ code: string }> {
    const response = await this.fetchWithAuth('invoices/generate-code');
    return response.json();
  }

  async getDefaultRates(): Promise<InvoiceRateDto[]> {
    const response = await this.fetchWithAuth('invoices/default-rates');
    return response.json();
  }

  async getSuggestedItems(workOrderIds: string[]): Promise<InvoiceItemCreationDto[]> {
    const response = await this.fetchWithAuth('invoices/suggested-items', {
      method: 'POST',
      body: JSON.stringify(workOrderIds),
    });
    return response.json();
  }

  async exportToPdf(id: string): Promise<Blob> {
    const response = await this.fetchWithAuth(`invoices/${id}/export`);
    return response.blob();
  }
}