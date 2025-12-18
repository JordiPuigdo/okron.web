import { useEffect, useState } from 'react';

import {
  Holiday,
  HolidayCreateRequest,
  HolidayUpdateRequest,
} from '../interfaces/Holiday';
import { HolidayService } from '../services/holidayService';

export const useHolidays = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const holidayService = new HolidayService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  const fetchHolidays = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await holidayService.getAll();
      setHolidays(data);
    } catch (err) {
      setError('Error fetching holidays');
      console.error('Error fetching holidays:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHolidaysByYear = async (year: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await holidayService.getByYear(year);
      setHolidays(data);
    } catch (err) {
      setError('Error fetching holidays by year');
      console.error('Error fetching holidays by year:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createHoliday = async (holidayData: HolidayCreateRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const newHoliday = await holidayService.create(holidayData);
      setHolidays([...holidays, newHoliday]);
      return newHoliday;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error creating holiday';
      setError(errorMessage);
      console.error('Error creating holiday:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateHoliday = async (holidayData: HolidayUpdateRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedHoliday = await holidayService.update(holidayData);
      setHolidays(
        holidays.map(h => (h.id === updatedHoliday.id ? updatedHoliday : h))
      );
      return updatedHoliday;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error updating holiday';
      setError(errorMessage);
      console.error('Error updating holiday:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHoliday = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await holidayService.delete(id);
      setHolidays(holidays.filter(h => h.id !== id));
    } catch (err) {
      setError('Error deleting holiday');
      console.error('Error deleting holiday:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  return {
    holidays,
    isLoading,
    error,
    fetchHolidays,
    fetchHolidaysByYear,
    createHoliday,
    updateHoliday,
    deleteHoliday,
  };
};
