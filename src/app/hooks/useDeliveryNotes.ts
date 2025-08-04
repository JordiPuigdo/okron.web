import { useState } from 'react';
import { DeliveryNote, DeliveryNoteCreateRequest, DeliveryNoteUpdateRequest } from 'app/interfaces/DeliveryNote';

export const useDeliveryNotes = () => {
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveryNotes = async (filters?: any) => {
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
      if (filters?.companyName) {
        queryParams.append('companyName', filters.companyName);
      }
      if (filters?.status !== undefined) {
        queryParams.append('status', filters.status.toString());
      }

      const response = await fetch(`/api/deliverynotes?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch delivery notes');
      }

      const data = await response.json();
      setDeliveryNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeliveryNoteById = async (id: string): Promise<DeliveryNote> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/deliverynotes/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch delivery note');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createDeliveryNote = async (deliveryNoteData: DeliveryNoteCreateRequest): Promise<DeliveryNote> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/deliverynotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deliveryNoteData),
      });

      if (!response.ok) {
        throw new Error('Failed to create delivery note');
      }

      const newDeliveryNote = await response.json();
      setDeliveryNotes(prev => [...prev, newDeliveryNote]);
      return newDeliveryNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDeliveryNote = async (deliveryNoteData: DeliveryNoteUpdateRequest): Promise<DeliveryNote> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/deliverynotes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deliveryNoteData),
      });

      if (!response.ok) {
        throw new Error('Failed to update delivery note');
      }

      const updatedDeliveryNote = await response.json();
      setDeliveryNotes(prev =>
        prev.map(deliveryNote =>
          deliveryNote.id === updatedDeliveryNote.id ? updatedDeliveryNote : deliveryNote
        )
      );
      return updatedDeliveryNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDeliveryNote = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/deliverynotes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete delivery note');
      }

      setDeliveryNotes(prev => prev.filter(deliveryNote => deliveryNote.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const generateCode = async (): Promise<{ code: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/deliverynotes/generate-code');

      if (!response.ok) {
        throw new Error('Failed to generate delivery note code');
      }

      return response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deliveryNotes,
    isLoading,
    error,
    fetchDeliveryNotes,
    fetchDeliveryNoteById,
    createDeliveryNote,
    updateDeliveryNote,
    deleteDeliveryNote,
    generateCode,
  };
};