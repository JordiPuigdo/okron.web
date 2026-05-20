export interface DeviceMeasurements {
  frequencyHz?: number;
  currentAmps?: number;
  powerKw?: number;
  loadPercent?: number;
  busVoltageVdc?: number;
  motorVoltageV?: number;
  heatsinkTempC?: number;
  internalTempC?: number;
  faultCode?: number;
}

export interface DeviceStatus {
  ready?: boolean;
  running?: boolean;
  fault?: boolean;
  atSpeed?: boolean;
  overloaded?: boolean;
  powerLoss?: boolean;
  highTemperature?: boolean;
  reverseRotation?: boolean;
}

export interface DeviceTelemetry {
  deviceCode: string;
  timestamp: string;
  status?: DeviceStatus;
  measurements?: DeviceMeasurements;
  energyKwh?: number;
}

export interface GetDeviceTelemetryRequest {
  deviceCode?: string;
  startDate?: string;
  endDate?: string;
}

export default DeviceTelemetry;
