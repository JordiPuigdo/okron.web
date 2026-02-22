import { useState } from 'react';
import {
  CreditNote,
  CreditNoteCreationRequest,
  CreditNoteListRequest,
  CreditNoteSearchFilters,
  CreditNoteUpdateRequest,
} from 'app/interfaces/CreditNote';
import { CreditNoteService } from 'app/services/creditNoteService';

export const useCreditNotes = () => {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const creditNoteService = new CreditNoteService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  const fetchCreditNotes = async (filters?: CreditNoteListRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await creditNoteService.getAll(filters);
      setCreditNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCreditNoteById = async (id: string): Promise<CreditNote> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await creditNoteService.getById(id);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createCreditNote = async (
    request: CreditNoteCreationRequest
  ): Promise<CreditNote> => {
    setIsLoading(true);
    setError(null);
    try {
      const newCreditNote = await creditNoteService.create(request);
      setCreditNotes(prev => [...prev, newCreditNote]);
      return newCreditNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCreditNote = async (
    request: CreditNoteUpdateRequest
  ): Promise<CreditNote> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedCreditNote = await creditNoteService.update(request);
      setCreditNotes(prev =>
        prev.map(cn =>
          cn.id === updatedCreditNote.id ? updatedCreditNote : cn
        )
      );
      return updatedCreditNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCreditNote = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await creditNoteService.delete(id);
      setCreditNotes(prev => prev.filter(cn => cn.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const searchCreditNotes = async (
    filters: CreditNoteSearchFilters
  ): Promise<CreditNote[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await creditNoteService.searchCreditNotes(filters);
      setCreditNotes(results);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const generateCreditNoteCode = async (): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const code = await creditNoteService.generateCode();
      return code;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    creditNotes,
    isLoading,
    error,
    fetchCreditNotes,
    fetchCreditNoteById,
    createCreditNote,
    updateCreditNote,
    deleteCreditNote,
    searchCreditNotes,
    generateCreditNoteCode,
  };
};
