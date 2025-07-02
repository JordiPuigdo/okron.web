import { BaseModel } from './BaseModel';

export interface PaymentMethod extends BaseModel {
  code: string;
  description: string;
  customerId?: string;
}
