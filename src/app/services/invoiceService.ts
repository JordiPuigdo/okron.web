import { Invoice, InvoiceCreateRequest, InvoiceUpdateRequest } from '../interfaces/Invoice';

export class InvoiceService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getAll(filters?: any): Promise<Invoice[]> {
    const queryParams = new URLSearchParams();

    if (filters?.startDate) {
      queryParams.append('startDate', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      queryParams.append('endDate', filters.endDate.toISOString());
    }
    if (filters?.customerId) {
      queryParams.append('customerId', filters.customerId);
    }
    if (filters?.status !== undefined) {
      queryParams.append('status', filters.status.toString());
    }

    const response = await fetch(`${this.baseUrl}/invoices?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch invoices');
    }

    return response.json();
  }

  async getById(id: string): Promise<Invoice> {
    const response = await fetch(`${this.baseUrl}/invoices/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch invoice');
    }

    return response.json();
  }

  async create(invoiceData: InvoiceCreateRequest): Promise<Invoice> {
    const response = await fetch(`${this.baseUrl}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      throw new Error('Failed to create invoice');
    }

    return response.json();
  }

  async update(invoiceData: InvoiceUpdateRequest): Promise<Invoice> {
    const response = await fetch(`${this.baseUrl}/invoices/${invoiceData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      throw new Error('Failed to update invoice');
    }

    return response.json();
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/invoices/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete invoice');
    }
  }
}