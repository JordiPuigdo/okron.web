import { BaseModel } from './BaseModel';
import { Rate } from './Rate';

export interface CustomerAddress extends BaseModel {
  postalCode: string;
  address: string;
  city: string;
  country: string;
  province: string;
  isPrimary: boolean;
}

export interface CustomerContact extends BaseModel {
  email: string;
  name: string;
  phone: string;
  description: string;
}

export interface PaymentMethod extends BaseModel {
  description: string;
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
  paymentMethod: PaymentMethod;
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
  address?: CustomerAddressRequest[];
  contacts?: CustomerContact[];
  paymentMethod?: PaymentMethod;
  rates?: Rate[];
  installations?: CustomerInstallations[];
  active?: boolean;
}

export interface CustomerAddressRequest {
  postalCode: string;
  address: string;
  province: string;
  city: string;
  country: string;
  isPrimary: boolean;
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
