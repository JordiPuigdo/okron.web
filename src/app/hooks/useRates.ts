import { useEffect, useState } from 'react';
import { Rate, RateType } from 'app/interfaces/Rate';
import { RateService } from 'app/services/rateService';

import { useTranslations } from './useTranslations';

export function useRates() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateTypes, setRateTypes] = useState<RateType[]>([]);
  const { t } = useTranslations();

  const rateService = new RateService();

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rateService.getAll();
      setRates(data.sort((a, b) => a.type!.code.localeCompare(b.type!.code)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRateTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rateService.getAllTypes();
      setRateTypes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    fetchRateTypes();
  }, []);

  const createRate = async (data: Omit<Rate, 'id'>): Promise<Rate> => {
    setLoading(true);
    setError(null);
    try {
      const newRate = await rateService.create(data);
      setRates(prev => [...prev, newRate]);
      return newRate;
    } catch (err: any) {
      setError(err.message);
      throw err; // <--- Esto soluciona el error
    } finally {
      setLoading(false);
    }
  };

  const updateRate = async (id: string, data: Partial<Rate>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await rateService.update(id, data);
      setRates(prev => prev.map(r => (r.id === updated.id ? updated : r)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteRate = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await rateService.remove(id);
      setRates(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createRateType = async (data: Omit<RateType, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const newType = await rateService.createType(data);
      setRateTypes(prev => [...prev, newType]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRateType = async (data: RateType) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await rateService.updateType(data);
      setRateTypes(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteRateType = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      if (rates.find(r => r.rateTypeId === id)) {
        setError(t('rates.error.cannot.delete.type.with.rates'));
        /*setTimeout(() => {
          setError(null);
        }, 3000);*/
        return;
      }

      await rateService.removeType(id);
      setRateTypes(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    rates,
    rateTypes,
    loading,
    error,
    fetchRates,
    fetchRateTypes,
    createRate,
    updateRate,
    deleteRate,
    createRateType,
    updateRateType,
    deleteRateType,
  };
}
