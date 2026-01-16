import { DeliveryNote } from '../interfaces';
import {
  DeliveryNoteSearchFilters,
  Invoice,
  InvoiceCreateRequest,
  InvoiceSearchFilters,
  InvoiceUpdateRequest,
} from '../interfaces/Invoice';

export class InvoiceService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getAll(filters?: any): Promise<Invoice[]> {
    const queryParams = new URLSearchParams();

    if (filters?.startDate) {
      const startDate = new Date(filters.startDate);
      queryParams.append('startDate', startDate.toISOString());
    }
    if (filters?.endDate) {
      const endDate = new Date(filters.endDate);
      queryParams.append('endDate', endDate.toISOString());
    }
    if (filters?.customerId) {
      queryParams.append('customerId', filters.customerId);
    }
    if (filters?.status !== undefined) {
      queryParams.append('status', filters.status.toString());
    }

    const response = await fetch(
      `${this.baseUrl}invoices?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch invoices');
    }

    return response.json();
  }

  async getById(id: string): Promise<Invoice> {
    const response = await fetch(`${this.baseUrl}invoices/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch invoice');
    }

    return response.json();
  }

  async create(invoiceData: InvoiceCreateRequest): Promise<Invoice> {
    const response = await fetch(`${this.baseUrl}invoices`, {
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
    const response = await fetch(`${this.baseUrl}invoices/`, {
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
    const response = await fetch(`${this.baseUrl}invoices/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete invoice');
    }
  }

  async searchInvoices(filters: InvoiceSearchFilters): Promise<Invoice[]> {
    const response = await fetch(`${this.baseUrl}GetInvoicesWithFilters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      throw new Error('Failed to search invoices');
    }

    return response.json();
  }

  async searchDeliveryNotes(
    filters: DeliveryNoteSearchFilters
  ): Promise<DeliveryNote[]> {
    const response = await fetch(`${this.baseUrl}GetDeliveryNotesWithFilters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      throw new Error('Failed to search delivery notes');
    }

    return response.json();
  }

  async validateInvoiceCreation(
    deliveryNoteId: string
  ): Promise<{ isValid: boolean; message: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}deliveryNotes/${deliveryNoteId}`
      );

      if (!response.ok) {
        return { isValid: false, message: 'Delivery Note not found' };
      }

      const deliveryNote: DeliveryNote = await response.json();

      if (deliveryNote.status === 4) {
        // Cancelled
        return {
          isValid: false,
          message: 'Cannot create invoice from cancelled delivery note',
        };
      }

      return { isValid: true, message: 'Valid' };
    } catch (error) {
      return { isValid: false, message: 'Error validating delivery note' };
    }
  }
}
