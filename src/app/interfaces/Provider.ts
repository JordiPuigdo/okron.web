import { BaseModel } from './BaseModel';
import { ProviderSpareParts } from './SparePart';

export interface Provider extends BaseModel {
  name: string;
  nie: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  whatsappNumber: string;
}

export interface ProviderRequest {
  name: string;
  nie: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  whatsappNumber: string;
}

export interface UpdateProviderRequest extends ProviderRequest {
  id: string;
}

export interface AddSparePartProvider {
  sparePartId: string;
  price: number;
}

export interface SparePartProviderRequest {
  providerId: string;
  price: string;
}

export interface ProviderResponse extends Provider {
  providerSpareParts: ProviderSpareParts[];
}

export interface ProviderSparePartRequest {
  providerId: string;
  sparePartId: string;
  price: string;
}
