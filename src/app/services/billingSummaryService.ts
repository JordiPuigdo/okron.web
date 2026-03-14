import {
  BillingSummaryItem,
  BillingSummaryRequest,
} from '../interfaces/BillingSummary';

export class BillingSummaryService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getSummary(
    request: BillingSummaryRequest
  ): Promise<BillingSummaryItem[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', new Date(request.startDate).toISOString());
    queryParams.append('endDate', new Date(request.endDate).toISOString());

    const response = await fetch(
      `${this.baseUrl}billing-summary?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch billing summary');
    }

    return response.json();
  }
}
