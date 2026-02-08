import { useEffect, useState } from 'react';
import {
  CreateFamilyRequest,
  Family,
  UpdateFamilyRequest,
} from 'app/interfaces/Family';
import { FamilyService } from 'app/services/familyService';

export function useFamilies() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const familyService = new FamilyService();

  const fetchFamilies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await familyService.getAll();
      setFamilies(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  const createFamily = async (data: CreateFamilyRequest): Promise<Family> => {
    setLoading(true);
    setError(null);
    try {
      const newFamily = await familyService.create(data);
      setFamilies(prev => [...prev, newFamily]);
      return newFamily;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      }
      setError('An unknown error occurred');
      throw new Error('An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getById = async (id: string): Promise<Family | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const family = await familyService.getById(id);
      return family;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const getSubfamilies = async (
    parentId: string
  ): Promise<Family[] | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const subfamilies = await familyService.getByParentId(parentId);
      return subfamilies;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateFamily = async (data: UpdateFamilyRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const updated = await familyService.update(data);
      if (updated) {
        setFamilies(prev =>
          prev.map(f => (f.id === data.id ? { ...f, ...data } : f))
        );
        return true;
      }
      return false;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      }
      setError('An unknown error occurred');
      throw new Error('An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const removeFamily = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await familyService.remove(id);
      setFamilies(prev => prev.filter(f => f.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      }
      setError('An unknown error occurred');
      throw new Error('An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const family = families.find(f => f.id === id);
      if (!family) throw new Error('Family not found');
      
      const newActiveState = !family.active;
      await familyService.toggleActive(id, newActiveState);
      setFamilies(prev =>
        prev.map(f => (f.id === id ? { ...f, active: newActiveState } : f))
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        throw err;
      }
      setError('An unknown error occurred');
      throw new Error('An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async (id: string): Promise<string | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const code = await familyService.generateCode(id);
      return code;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    families,
    loading,
    error,
    fetchFamilies,
    createFamily,
    getById,
    getSubfamilies,
    updateFamily,
    removeFamily,
    toggleActive,
    generateCode,
  };
}
