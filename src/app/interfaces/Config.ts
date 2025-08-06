import Company from './Company';

export interface WOConfiguration {
  // Define las propiedades específicas de WOConfiguration según tu DTO
}

export interface SystemConfiguration {
  version: number;
  clientName: string;
  isCRM: boolean;
  wOConfiguration: WOConfiguration;
  company: Company;
}
