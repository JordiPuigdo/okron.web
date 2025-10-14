import { BaseModel } from './BaseModel';
import { CustomerAddress } from './Customer';

export default interface Company extends BaseModel {
  name: string;
  fiscalName: string;
  urlLogo: string;
  cssLogo: string;
  email: string;
  nif: string;
  phone: string;
  iban: string;
  address: CustomerAddress;
}
