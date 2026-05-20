import { BaseModel } from './BaseModel';

export enum VacationStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Cancelled = 3,
}

export enum VacationType {
  FullDay = 0,
  Hours = 1,
}

export interface VacationRequest extends BaseModel {
  operatorId: string;
  operatorName?: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: VacationStatus;
  vacationType: VacationType;
  approvedBy?: string;
  approvedDate?: Date;
  rejectionReason?: string;
  totalDays: number;
  totalHours: number;
  startTime?: string;
  endTime?: string;
}

export interface VacationBalance {
  operatorId: string;
  totalHours: number;
  usedHours: number;
  availableHours: number;
  workingHoursPerDay: number;
  totalDays: number;
  usedDays: number;
  availableDays: number;
}

export interface CreateVacationRequestDto {
  operatorId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  vacationType: VacationType;
  startTime?: string;
  endTime?: string;
}

export interface UpdateVacationRequestDto extends CreateVacationRequestDto {
  id: string;
}

export interface ApprovalRequestDto {
  userId: string;
}

export interface RejectionRequestDto {
  userId: string;
  rejectionReason: string;
}

export interface VacationRequestSummary {
  operatorId: string;
  operatorName: string;
  startDate: Date;
  endDate: Date;
  workingDays: number;
  totalHours: number;
  vacationType: VacationType;
  workingHoursPerDay: number;
  status: VacationStatus;
  reason: string;
}
