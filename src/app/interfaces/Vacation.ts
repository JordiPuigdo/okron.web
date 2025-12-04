import { BaseModel } from './BaseModel';

export enum VacationStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Cancelled = 3,
}

export interface VacationRequest extends BaseModel {
  operatorId: string;
  operatorName?: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: VacationStatus;
  approvedBy?: string;
  approvedDate?: Date;
  rejectionReason?: string;
  totalDays: number;
}

export interface VacationBalance {
  operatorId: string;
  availableDays: number;
  usedDays: number;
  totalDays: number;
  pendingDays?: number;
}

export interface CreateVacationRequestDto {
  operatorId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
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
  status: VacationStatus;
  reason: string;
}
