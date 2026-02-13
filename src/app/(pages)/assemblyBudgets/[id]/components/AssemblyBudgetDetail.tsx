'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useArticles } from 'app/hooks/useArticles';
import { useTranslations } from 'app/hooks/useTranslations';
import { Article } from 'app/interfaces/Article';
import {
  AddAssemblyArticleRequest,
  AddAssemblyFolderRequest,
  Budget,
  BudgetStatus,
  UpdateAssemblyBudgetRequest,
} from 'app/interfaces/Budget';
import useRoutes from 'app/utils/useRoutes';
import { HeaderForm } from 'components/layout/HeaderForm';
import { useRouter } from 'next/navigation';

import { ArticleFormModal } from '../../../articles/components/ArticleFormModal';
import { AddArticleModal } from './AddArticleModal';
import { AddFolderModal } from './AddFolderModal';
import { AssemblyBudgetCommentsPanel } from './AssemblyBudgetCommentsPanel';
import { AssemblyBudgetCustomerCard } from './AssemblyBudgetCustomerCard';
import { AssemblyBudgetFooterActions } from './AssemblyBudgetFooterActions';
import { countNodes } from './AssemblyBudgetStatusConfig';
import { AssemblyBudgetTopBar } from './AssemblyBudgetTopBar';
import { AssemblyBudgetTotalsCard } from './AssemblyBudgetTotalsCard';
import { AssemblyTreePanel } from './AssemblyTreePanel';

interface AssemblyBudgetDetailProps {
  budget: Budget;
  onUpdate: (
    request: UpdateAssemblyBudgetRequest
  ) => Promise<Budget | undefined>;
  onAddFolder: (
    request: AddAssemblyFolderRequest
  ) => Promise<Budget | undefined>;
  onAddArticle: (
    request: AddAssemblyArticleRequest
  ) => Promise<Budget | undefined>;
}

export function AssemblyBudgetDetail({
  budget,
  onUpdate,
  onAddFolder,
  onAddArticle,
}: AssemblyBudgetDetailProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const routes = useRoutes();
  const { articles, fetchArticles } = useArticles();

  const [formData, setFormData] = useState<Budget>(budget);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isCreateArticleOpen, setIsCreateArticleOpen] = useState(false);
  const [selectedParentNodeId, setSelectedParentNodeId] = useState<
    string | undefined
  >(undefined);

  const isReadOnly = budget.active === false;

  useEffect(() => {
    setFormData(budget);
  }, [budget]);

  const nodeStats = useMemo(
    () => countNodes(formData.assemblyNodes),
    [formData.assemblyNodes]
  );

  const handleFieldChange = useCallback(
    (field: keyof Budget, value: string | number) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      handleFieldChange('status', Number(value) as BudgetStatus);
    },
    [handleFieldChange]
  );

  const handleValidUntilChange = useCallback(
    (date: Date) => {
      handleFieldChange('validUntil', date.toISOString());
    },
    [handleFieldChange]
  );

  const handleExternalCommentsChange = useCallback(
    (value: string) => {
      handleFieldChange('externalComments', value);
    },
    [handleFieldChange]
  );

  const handleInternalCommentsChange = useCallback(
    (value: string) => {
      handleFieldChange('internalComments', value);
    },
    [handleFieldChange]
  );

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || isReadOnly) return;

    setIsSubmitting(true);
    try {
      const request: UpdateAssemblyBudgetRequest = {
        id: formData.id,
        externalComments: formData.externalComments,
        internalComments: formData.internalComments,
        status: formData.status,
        validUntil: formData.validUntil,
      };
      const updated = await onUpdate(request);
      if (updated) {
        setSuccessMessage(t('assemblyBudget.updated.successfully'));
        setTimeout(() => setSuccessMessage(undefined), 3000);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, isReadOnly, formData, onUpdate, t]);

  const handleOpenFolderModal = useCallback((parentNodeId?: string) => {
    setSelectedParentNodeId(parentNodeId);
    setIsFolderModalOpen(true);
  }, []);

  const handleOpenArticleModal = useCallback((parentNodeId?: string) => {
    setSelectedParentNodeId(parentNodeId);
    setIsArticleModalOpen(true);
  }, []);

  const handleAddFolder = useCallback(
    async (code: string, description: string) => {
      const request: AddAssemblyFolderRequest = {
        budgetId: formData.id,
        parentNodeId: selectedParentNodeId,
        code,
        description,
      };
      const updated = await onAddFolder(request);
      if (updated) {
        setIsFolderModalOpen(false);
      }
    },
    [formData.id, selectedParentNodeId, onAddFolder]
  );

  const handleAddArticle = useCallback(
    async (article: Article, quantity: number, marginPercentage: number) => {
      const request: AddAssemblyArticleRequest = {
        budgetId: formData.id,
        parentNodeId: selectedParentNodeId,
        articleId: article.id,
        quantity,
        unitPrice: article.unitPrice,
        marginPercentage,
      };
      const updated = await onAddArticle(request);
      if (updated) {
        setIsArticleModalOpen(false);
      }
    },
    [formData.id, selectedParentNodeId, onAddArticle]
  );

  const handleArticleCreated = useCallback(() => {
    setIsCreateArticleOpen(false);
    fetchArticles();
  }, [fetchArticles]);

  const handleCancel = useCallback(() => {
    router.push(routes.assemblyBudget.list);
  }, [router, routes.assemblyBudget.list]);

  const handleCloseFolderModal = useCallback(() => {
    setIsFolderModalOpen(false);
  }, []);

  const handleCloseArticleModal = useCallback(() => {
    setIsArticleModalOpen(false);
  }, []);

  const handleOpenCreateArticle = useCallback(() => {
    setIsArticleModalOpen(false);
    setIsCreateArticleOpen(true);
  }, []);

  const handleCancelCreateArticle = useCallback(() => {
    setIsCreateArticleOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/80">
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-4">
        <HeaderForm header={formData.code} isCreate={false} />

        <AssemblyBudgetTopBar
          budget={formData}
          isReadOnly={isReadOnly}
          onStatusChange={handleStatusChange}
          onValidUntilChange={handleValidUntilChange}
          t={t}
        />

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
          <AssemblyTreePanel
            nodes={formData.assemblyNodes}
            nodeStats={nodeStats}
            isReadOnly={isReadOnly}
            onAddFolder={handleOpenFolderModal}
            onAddArticle={handleOpenArticleModal}
            t={t}
          />

          <div className="space-y-4">
            <AssemblyBudgetTotalsCard budget={formData} t={t} />
            <AssemblyBudgetCustomerCard budget={formData} t={t} />
            <AssemblyBudgetCommentsPanel
              externalComments={formData.externalComments}
              internalComments={formData.internalComments}
              isReadOnly={isReadOnly}
              onExternalChange={handleExternalCommentsChange}
              onInternalChange={handleInternalCommentsChange}
              t={t}
            />
          </div>
        </div>

        {!isReadOnly && (
          <AssemblyBudgetFooterActions
            isSubmitting={isSubmitting}
            successMessage={successMessage}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            t={t}
          />
        )}
      </div>

      <AddFolderModal
        isVisible={isFolderModalOpen}
        onClose={handleCloseFolderModal}
        onConfirm={handleAddFolder}
        t={t}
      />

      <AddArticleModal
        isVisible={isArticleModalOpen}
        articles={articles}
        onClose={handleCloseArticleModal}
        onConfirm={handleAddArticle}
        onCreateNew={handleOpenCreateArticle}
        t={t}
      />

      <ArticleFormModal
        isVisible={isCreateArticleOpen}
        onSuccess={handleArticleCreated}
        onCancel={handleCancelCreateArticle}
      />
    </div>
  );
}
