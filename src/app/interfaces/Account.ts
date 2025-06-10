import { BaseModel } from './BaseModel';

export interface Account extends BaseModel {
  code: string;
  description: string;
}

export interface CreateAccountRequest {
  code: string;
  description: string;
}

export interface UpdateAccountRequest extends CreateAccountRequest {
  id: string;
  active: boolean;
}
