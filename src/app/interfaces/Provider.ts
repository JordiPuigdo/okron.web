import { BaseModel } from './BaseModel';
import { ProviderSpareParts } from './SparePart';

export interface Provider extends BaseModel {
  name: string;
  commercialName: string;
  nie: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  whatsappNumber: string;
  accountNumber: string;
  paymentMethod: string;
}

export interface ProviderRequest {
  name: string;
  commercialName: string;
  nie: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  whatsappNumber: string;
  accountNumber: string;
  paymentMethod: string;
}

export interface UpdateProviderRequest extends ProviderRequest {
  id: string;
  active: boolean;
}

export interface AddSparePartProvider {
  sparePartId: string;
  price: number;
}

export interface SparePartProviderRequest {
  providerId: string;
  price: string;
  isDefault: boolean;
}

export interface ProviderResponse extends Provider {
  providerSpareParts: ProviderSpareParts[];
}

export interface ProviderSparePartRequest {
  providerId: string;
  sparePartId: string;
  price: string;
}

export interface UpdateSparePartDiscountRequest {
  providerId: string;
  sparePartId: string;
  discount: number;
}
