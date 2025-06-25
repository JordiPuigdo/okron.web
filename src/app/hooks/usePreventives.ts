import { useEffect, useState } from 'react';
import { DailyPreventives } from 'app/interfaces/Preventive';
import preventiveService from 'app/services/preventiveService';

export function usePreventiveSchedule(startDate: string, endDate: string) {
  const [schedule, setSchedule] = useState<DailyPreventives[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const prevService = new preventiveService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await prevService.generateSchedulePreventives(
          startDate,
          endDate
        );
        setSchedule(data);
      } catch (err) {
        setError('Error cargando planificación de preventivos');
      } finally {
        setLoading(false);
      }
    };

    if (startDate && endDate) {
      fetchSchedule();
    }
  }, [startDate, endDate]);

  return {
    schedule,
    loading,
    error,
  };
}
