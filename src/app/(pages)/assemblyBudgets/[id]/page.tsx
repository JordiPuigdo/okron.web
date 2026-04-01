'use client';

import { useCallback, useEffect } from 'react';
import { useBudgetAssembly } from 'app/hooks/useBudgetAssembly';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import { AssemblyBudgetDetail } from './components/AssemblyBudgetDetail';

interface AssemblyBudgetDetailPageProps {
  params: { id: string };
}

export default function AssemblyBudgetDetailPage({
  params,
}: AssemblyBudgetDetailPageProps) {
  const { t } = useTranslations();
  const { budget, loading, error, fetchBudgetById, updateAssemblyBudget, addFolder, addArticle, reorganizeNodes, removeNode, updateNode, updateMargin, importNodes } =
    useBudgetAssembly();

  const handleRefreshBudget = useCallback(async () => {
    await fetchBudgetById(params.id);
  }, [fetchBudgetById, params.id]);

  useEffect(() => {
    fetchBudgetById(params.id);
  }, [params.id]);

  if (loading && !budget) {
    return (
      <MainLayout>
        <Container fullWidth>
          <div className="flex justify-center items-center h-64">
            <SvgSpinner className="w-8 h-8" />
          </div>
        </Container>
      </MainLayout>
    );
  }

  if (error && !budget) {
    return (
      <MainLayout>
        <Container fullWidth>
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{t('assemblyBudget.not.found')}</p>
          </div>
        </Container>
      </MainLayout>
    );
  }

  if (!budget) return null;

  return (
    <MainLayout>
      <Container fullWidth>
        <AssemblyBudgetDetail
          budget={budget}
          onUpdate={updateAssemblyBudget}
          onAddFolder={addFolder}
          onAddArticle={addArticle}
          onReorganizeNodes={reorganizeNodes}
          onRemoveNode={removeNode}
          onUpdateNode={updateNode}
          onUpdateMargin={updateMargin}
          onImportNodes={importNodes}
          onRefreshBudget={handleRefreshBudget}
        />
      </Container>
    </MainLayout>
  );
}
