import { BaseModel } from './BaseModel';

export interface RateType extends BaseModel {
  code: string;
  description?: string;
}

export interface Rate extends BaseModel {
  price: number;
  daysOfWeek: DayOfWeek[]; // Usarás un enum para los días
  startTime: string; // Formato 'HH:mm:ss' o ISO 8601
  endTime: string; // Formato 'HH:mm:ss' o ISO 8601
  rateTypeId: string;
  type?: RateType;
  customerId?: string | null;
  customerInstallationId?: string | null;
}

export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}
