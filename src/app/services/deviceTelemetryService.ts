import DeviceTelemetry, { GetDeviceTelemetryRequest } from 'app/interfaces/DeviceTelemetry';

class DeviceTelemetryService {
  private static instance: DeviceTelemetryService;
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public static getInstance(baseUrl?: string): DeviceTelemetryService {
    if (!DeviceTelemetryService.instance && baseUrl) {
      DeviceTelemetryService.instance = new DeviceTelemetryService(baseUrl);
    }
    return DeviceTelemetryService.instance;
  }

  async getDeviceCodes(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}devicetelemetry/codes`);
      if (!response.ok) throw new Error('Failed to fetch device codes');
      return response.json();
    } catch (error) {
      console.error('Error fetching device codes:', error);
      throw error;
    }
  }

  async getAll(request: GetDeviceTelemetryRequest): Promise<DeviceTelemetry[]> {
    try {
      const params = new URLSearchParams();
      if (request.deviceCode) params.append('deviceCode', request.deviceCode);
      if (request.startDate) params.append('startDate', request.startDate);
      if (request.endDate) params.append('endDate', request.endDate);

      const response = await fetch(
        `${this.baseUrl}devicetelemetry?${params.toString()}`
      );
      if (!response.ok) throw new Error('Failed to fetch device telemetry');
      return response.json();
    } catch (error) {
      console.error('Error fetching device telemetry:', error);
      throw error;
    }
  }
}

export const deviceTelemetryService = DeviceTelemetryService.getInstance(
  process.env.NEXT_PUBLIC_API_BASE_URL!
);
