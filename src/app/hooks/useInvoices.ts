import { useState } from 'react';
import { DeliveryNote } from 'app/interfaces/DeliveryNote';
import { DeliveryNoteSearchFilters,Invoice, InvoiceCreateRequest, InvoiceSearchFilters, InvoiceUpdateRequest } from 'app/interfaces/Invoice';
import { InvoiceService } from 'app/services/invoiceService';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const invoiceService = new InvoiceService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  const fetchInvoices = async (filters?: any) => {
    setIsLoading(true);
    setError(null);
    try {
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

      const response = await fetch(`/api/invoices?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const data = await response.json();
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvoiceById = async (id: string): Promise<Invoice> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/invoices/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch invoice');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createInvoice = async (invoiceData: InvoiceCreateRequest): Promise<Invoice> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      const newInvoice = await response.json();
      setInvoices(prev => [...prev, newInvoice]);
      return newInvoice;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateInvoice = async (invoiceData: InvoiceUpdateRequest): Promise<Invoice> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/invoices`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        throw new Error('Failed to update invoice');
      }

      const updatedInvoice = await response.json();
      setInvoices(prev =>
        prev.map(invoice =>
          invoice.id === updatedInvoice.id ? updatedInvoice : invoice
        )
      );
      return updatedInvoice;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInvoice = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }

      setInvoices(prev => prev.filter(invoice => invoice.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const searchInvoices = async (filters: InvoiceSearchFilters): Promise<Invoice[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await invoiceService.searchInvoices(filters);
      setInvoices(results);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const searchDeliveryNotes = async (filters: DeliveryNoteSearchFilters): Promise<DeliveryNote[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await invoiceService.searchDeliveryNotes(filters);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const validateInvoiceCreation = async (deliveryNoteId: string): Promise<{isValid: boolean, message: string}> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await invoiceService.validateInvoiceCreation(deliveryNoteId);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return { isValid: false, message: 'Error validating delivery note' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    invoices,
    isLoading,
    error,
    fetchInvoices,
    fetchInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    searchInvoices,
    searchDeliveryNotes,
    validateInvoiceCreation,
  };
};