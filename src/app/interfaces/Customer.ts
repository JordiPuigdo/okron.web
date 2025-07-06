import { BaseModel } from './BaseModel';
import { Rate } from './Rate';

export interface CustomerAddress extends BaseModel {
  postalCode: string;
  address: string;
  city: string;
  country: string;
  isPrimary: boolean;
}

export interface CustomerContact extends BaseModel {
  email: string;
  name: string;
  phone: string;
  description: string;
}

export interface PaymentMethod extends BaseModel {
  code: string;
  description: string;
  customerId?: string;
}

export interface Customer extends BaseModel {
  code: string;
  name: string;
  taxId: string;
  accountNumber: string;
  fiscalName: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  address: CustomerAddress[];
  contacts: CustomerContact[];
  paymentMethods: PaymentMethod[];
  rates: Rate[];
  installations: CustomerInstallations[];
}

export interface CreateCustomerRequest {
  code: string;
  name: string;
  taxId?: string;
  accountNumber?: string;
  fiscalName: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  address?: CustomerAddress[];
  contacts?: CustomerContact[];
  paymentMethods?: PaymentMethod[];
  rates?: Rate[];
  installations?: CustomerInstallations[];
  active?: boolean;
}

export interface UpdateCustomerRequest extends CreateCustomerRequest {
  id: string;
}

export interface CustomerInstallations extends BaseModel {
  code: string;
  address: CustomerAddress;
  contact: CustomerContact[];
  rates?: Rate[];
}
