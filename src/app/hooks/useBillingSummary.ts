import { useState } from 'react';
import {
  BillingSummaryItem,
  BillingSummaryRequest,
} from 'app/interfaces/BillingSummary';
import { BillingSummaryService } from 'app/services/billingSummaryService';

export const useBillingSummary = () => {
  const [summaryItems, setSummaryItems] = useState<BillingSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const billingSummaryService = new BillingSummaryService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  const fetchBillingSummary = async (request: BillingSummaryRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await billingSummaryService.getSummary(request);
      setSummaryItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    summaryItems,
    isLoading,
    error,
    fetchBillingSummary,
  };
};
