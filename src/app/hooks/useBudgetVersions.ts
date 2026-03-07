import { useCallback, useRef, useState } from 'react';
import {
  Budget,
  BudgetVersion,
  BudgetVersionSummary,
  CreateBudgetVersionRequest,
  RestoreBudgetVersionRequest,
  UpdateBudgetVersionDescriptionRequest,
} from 'app/interfaces/Budget';
import { BudgetVersionService } from 'app/services/budgetVersionService';

export function useBudgetVersions() {
  const [versions, setVersions] = useState<BudgetVersionSummary[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<
    BudgetVersion | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const serviceRef = useRef(
    new BudgetVersionService(process.env.NEXT_PUBLIC_API_BASE_URL!)
  );

  const executeAction = useCallback(
    async <T>(action: () => Promise<T>): Promise<T | undefined> => {
      try {
        setLoading(true);
        setError(undefined);
        return await action();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchVersionsByBudgetId = useCallback(
    async (budgetId: string) => {
      const result = await executeAction(() =>
        serviceRef.current.getVersionsByBudgetId(budgetId)
      );
      if (result) setVersions(result);
      return result;
    },
    [executeAction]
  );

  const fetchVersionById = useCallback(
    async (versionId: string) => {
      const result = await executeAction(() =>
        serviceRef.current.getVersionById(versionId)
      );
      if (result) setSelectedVersion(result);
      return result;
    },
    [executeAction]
  );

  const createVersion = useCallback(
    async (request: CreateBudgetVersionRequest) => {
      const result = await executeAction(() =>
        serviceRef.current.createVersion(request)
      );
      if (result) {
        setVersions((prev) => [...prev, result as unknown as BudgetVersionSummary]);
      }
      return result;
    },
    [executeAction]
  );

  const restoreVersion = useCallback(
    async (
      request: RestoreBudgetVersionRequest
    ): Promise<Budget | undefined> => {
      return executeAction(() => serviceRef.current.restoreVersion(request));
    },
    [executeAction]
  );

  const updateDescription = useCallback(
    async (
      request: UpdateBudgetVersionDescriptionRequest
    ): Promise<BudgetVersionSummary | undefined> => {
      const result = await executeAction(() =>
        serviceRef.current.updateDescription(request)
      );
      if (result) {
        setVersions(prev =>
          prev.map(v => (v.id === result.id ? { ...v, description: result.description } : v))
        );
      }
      return result;
    },
    [executeAction]
  );

  return {
    versions,
    selectedVersion,
    loading,
    error,
    fetchVersionsByBudgetId,
    fetchVersionById,
    createVersion,
    restoreVersion,
    updateDescription,
    setSelectedVersion,
  };
}
