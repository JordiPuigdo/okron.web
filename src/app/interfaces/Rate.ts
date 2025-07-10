import { BaseModel } from './BaseModel';

export interface RateType extends BaseModel {
  code: string;
  description?: string;
}

export interface Rate extends BaseModel {
  price: number;
  daysOfWeek: DayOfWeek[];
  startTime: string;
  endTime: string;
  rateTypeId: string;
  type?: RateType;
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
