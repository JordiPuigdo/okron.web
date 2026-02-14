import { useCallback, useRef, useState } from 'react';
import {
  AddAssemblyArticleRequest,
  AddAssemblyFolderRequest,
  AssemblyBudgetCreationRequest,
  Budget,
  MoveAssemblyNodeRequest,
  RemoveAssemblyNodeRequest,
  UpdateAssemblyBudgetRequest,
  UpdateAssemblyMarginRequest,
  UpdateAssemblyNodeRequest,
  UpdateAssemblyNodesMarginRequest,
} from 'app/interfaces/Budget';
import { BudgetAssemblyService } from 'app/services/budgetAssemblyService';

import { recalculateNodeCodes } from '../(pages)/assemblyBudgets/[id]/components/assemblyCodeUtils';

export function useBudgetAssembly() {
  const [budget, setBudget] = useState<Budget | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const serviceRef = useRef(
    new BudgetAssemblyService(process.env.NEXT_PUBLIC_API_BASE_URL!)
  );

  const executeAction = useCallback(
    async (action: () => Promise<Budget>): Promise<Budget | undefined> => {
      try {
        setLoading(true);
        setError(undefined);
        const result = recalculateNodeCodes(await action());
        setBudget(result);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchBudgetById = useCallback(
    (id: string) => executeAction(() => serviceRef.current.getById(id)),
    [executeAction]
  );

  const createAssemblyBudget = useCallback(
    (request: AssemblyBudgetCreationRequest) =>
      executeAction(() => serviceRef.current.create(request)),
    [executeAction]
  );

  const updateAssemblyBudget = useCallback(
    (request: UpdateAssemblyBudgetRequest) =>
      executeAction(() => serviceRef.current.update(request)),
    [executeAction]
  );

  const addFolder = useCallback(
    (request: AddAssemblyFolderRequest) =>
      executeAction(() => serviceRef.current.addFolder(request)),
    [executeAction]
  );

  const addArticle = useCallback(
    (request: AddAssemblyArticleRequest) =>
      executeAction(() => serviceRef.current.addArticle(request)),
    [executeAction]
  );

  const moveNode = useCallback(
    (request: MoveAssemblyNodeRequest) =>
      executeAction(() => serviceRef.current.moveNode(request)),
    [executeAction]
  );

  const removeNode = useCallback(
    (request: RemoveAssemblyNodeRequest) =>
      executeAction(() => serviceRef.current.removeNode(request)),
    [executeAction]
  );

  const updateNode = useCallback(
    (request: UpdateAssemblyNodeRequest) =>
      executeAction(() => serviceRef.current.updateNode(request)),
    [executeAction]
  );

  const recalculateTotals = useCallback(
    (budgetId: string) =>
      executeAction(() => serviceRef.current.recalculateTotals(budgetId)),
    [executeAction]
  );

  const updateMargin = useCallback(
    (request: UpdateAssemblyMarginRequest) =>
      executeAction(() => serviceRef.current.updateMargin(request)),
    [executeAction]
  );

  const updateNodesMargin = useCallback(
    (request: UpdateAssemblyNodesMarginRequest) =>
      executeAction(() => serviceRef.current.updateNodesMargin(request)),
    [executeAction]
  );

  return {
    budget,
    loading,
    error,
    setBudget,
    fetchBudgetById,
    createAssemblyBudget,
    updateAssemblyBudget,
    addFolder,
    addArticle,
    moveNode,
    removeNode,
    updateNode,
    recalculateTotals,
    updateMargin,
    updateNodesMargin,
  };
}
