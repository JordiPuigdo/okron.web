import { BaseModel } from './BaseModel';

export interface Family extends BaseModel {
  name: string;
  codePrefix: string;
  codePattern: string;
  lastCounterValue: number;
  parentFamilyId?: string | null;
  customAttributes?: Record<string, any>;
}

export interface CreateFamilyRequest {
  name: string;
  codePrefix: string;
  codePattern: string;
  parentFamilyId?: string | null;
  customAttributes?: Record<string, any>;
}

export interface UpdateFamilyRequest {
  id: string;
  name: string;
  codePrefix: string;
  codePattern: string;
  parentFamilyId?: string | null;
  customAttributes?: Record<string, any>;
}

export interface GenerateCodeResponse {
  code: string;
}
