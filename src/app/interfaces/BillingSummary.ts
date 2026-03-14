export interface BillingSummaryItem {
  type: string;
  date: string;
  code: string;
  nif: string | null;
  companyName: string;
  base21: number;
  base10: number;
  baseNoTax: number;
  iva21: number;
  iva10: number;
  total: number;
}

export interface BillingSummaryRequest {
  startDate: string;
  endDate: string;
}
