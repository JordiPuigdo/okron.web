import { useEffect, useState } from 'react';

import DeviceTelemetry, { GetDeviceTelemetryRequest } from 'app/interfaces/DeviceTelemetry';
import { deviceTelemetryService } from 'app/services/deviceTelemetryService';

export const useDeviceTelemetryHook = () => {
  const [telemetry, setTelemetry] = useState<DeviceTelemetry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GetDeviceTelemetryRequest>({});

  useEffect(() => {
    fetchTelemetry();
  }, [filters]);

  const fetchTelemetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await deviceTelemetryService.getAll(filters);
      setTelemetry(data);
    } catch {
      setError('Error loading telemetry data');
    } finally {
      setLoading(false);
    }
  };

  return { telemetry, loading, error, filters, setFilters };
};
