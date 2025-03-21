import { useCallback, useEffect, useState } from 'react';
import { DowntimesTicketReport } from 'app/interfaces/Production/DowntimesTicketReport';
import WorkOrderService from 'app/services/workOrderService';

const workOrderService = new WorkOrderService(
  process.env.NEXT_PUBLIC_API_BASE_URL || ''
);

export function useDowntimeReport() {
  const [downtimes, setDowntimes] = useState<DowntimesTicketReport[]>([]);
  const [from, setFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [to, setTo] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const fetchDowntimes = useCallback(async () => {
    setIsLoading(true);
    const data = await workOrderService.getDowntimesTicketReport({
      from: from.toISOString(),
      to: to.toISOString(),
    });
    setDowntimes(data);
    setIsLoading(false);
  }, [from, to]);

  useEffect(() => {
    fetchDowntimes();
  }, [fetchDowntimes]);

  return { downtimes, from, to, setFrom, setTo, fetchDowntimes, isLoading };
}
