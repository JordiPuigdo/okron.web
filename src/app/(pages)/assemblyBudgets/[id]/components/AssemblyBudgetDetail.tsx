'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useArticles } from 'app/hooks/useArticles';
import { useTranslations } from 'app/hooks/useTranslations';
import { Article } from 'app/interfaces/Article';
import {
  AddAssemblyArticleRequest,
  AddAssemblyFolderRequest,
  AssemblyArticle,
  AssemblyFolder,
  AssemblyNode,
  Budget,
  BudgetNodeType,
  BudgetStatus,
  RemoveAssemblyNodeRequest,
  ReorganizeAssemblyNodesRequest,
  UpdateAssemblyBudgetRequest,
  UpdateAssemblyMarginRequest,
  UpdateAssemblyNodeRequest,
} from 'app/interfaces/Budget';
import useRoutes from 'app/utils/useRoutes';
import { useRouter } from 'next/navigation';

import { ArticleFormModal } from '../../../articles/components/ArticleFormModal';
import { AddArticleModal } from './AddArticleModal';
import { AddFolderModal } from './AddFolderModal';
import { ApplyMarginModal, MarginChange } from './ApplyMarginModal';
import { AssemblyBudgetCommentsPanel } from './AssemblyBudgetCommentsPanel';
import { AssemblyBudgetFooterActions } from './AssemblyBudgetFooterActions';
import { AssemblyBudgetHeader } from './AssemblyBudgetHeader';
import { countNodes } from './AssemblyBudgetStatusConfig';
import { AssemblyBudgetTotalsCard } from './AssemblyBudgetTotalsCard';
import { generateNextCode } from './assemblyCodeUtils';
import { AssemblyTreePanel } from './AssemblyTreePanel';
import { BudgetVersionsModal } from './BudgetVersionsModal';

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
  onReorganizeNodes: (
    request: ReorganizeAssemblyNodesRequest
  ) => Promise<Budget | undefined>;
  onRemoveNode: (
    request: RemoveAssemblyNodeRequest
  ) => Promise<Budget | undefined>;
  onUpdateNode: (
    request: UpdateAssemblyNodeRequest
  ) => Promise<Budget | undefined>;
  onUpdateMargin: (
    request: UpdateAssemblyMarginRequest
  ) => Promise<Budget | undefined>;
  onRefreshBudget: () => Promise<void>;
}

function findFirstFolderId(
  nodes: AssemblyNode[] | undefined
): string | undefined {
  if (!nodes) return undefined;
  for (const node of nodes) {
    if (node.nodeType === BudgetNodeType.Folder) return node.id;
  }
  return undefined;
}

function findNodeByIdInTree(
  nodes: AssemblyNode[] | undefined,
  targetId: string
): AssemblyNode | undefined {
  if (!nodes) return undefined;
  for (const node of nodes) {
    if (node.id === targetId) return node;
    if (node.nodeType === BudgetNodeType.Folder) {
      const found = findNodeByIdInTree(
        (node as AssemblyFolder).children || [],
        targetId
      );
      if (found) return found;
    }
  }
  return undefined;
}

function findParentIdInTree(
  nodes: AssemblyNode[] | undefined,
  targetId: string,
  currentParentId?: string
): string | undefined {
  if (!nodes) return undefined;
  for (const node of nodes) {
    if (node.id === targetId) return currentParentId;
    if (node.nodeType === BudgetNodeType.Folder) {
      const found = findParentIdInTree(
        (node as AssemblyFolder).children || [],
        targetId,
        node.id
      );
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

function collectNodeIds(nodes: AssemblyNode[] | undefined): Set<string> {
  const ids = new Set<string>();
  if (!nodes) return ids;

  const walk = (items: AssemblyNode[]) => {
    for (const node of items) {
      ids.add(node.id);
      if (node.nodeType === BudgetNodeType.Folder) {
        walk((node as AssemblyFolder).children || []);
      }
    }
  };

  walk(nodes);
  return ids;
}

function getInsertedNodeId(
  previousNodes: AssemblyNode[] | undefined,
  nextNodes: AssemblyNode[] | undefined
): string | undefined {
  const previousIds = collectNodeIds(previousNodes);
  const nextIds = collectNodeIds(nextNodes);

  for (const nextId of nextIds) {
    if (!previousIds.has(nextId)) return nextId;
  }

  return undefined;
}

function calculateTotalWithMargin(
  baseAmount: number,
  marginPercentage: number
): number {
  const divisor = 1 - marginPercentage / 100;
  if (divisor <= 0) return baseAmount;
  return baseAmount / divisor;
}

export function AssemblyBudgetDetail({
  budget,
  onUpdate,
  onAddFolder,
  onAddArticle,
  onReorganizeNodes,
  onRemoveNode,
  onUpdateNode,
  onUpdateMargin,
  onRefreshBudget,
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
  const [isMarginModalOpen, setIsMarginModalOpen] = useState(false);
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
  const [selectedParentNodeId, setSelectedParentNodeId] = useState<
    string | undefined
  >(undefined);
  const [preSelectedArticle, setPreSelectedArticle] = useState<
    Article | undefined
  >(undefined);
  const [editingArticle, setEditingArticle] = useState<
    Article | undefined
  >(undefined);

  const isReadOnly = budget.active === false;

  useEffect(() => {
    setFormData(budget);
  }, [budget]);

  const nodeStats = useMemo(
    () => countNodes(formData.assemblyNodes),
    [formData.assemblyNodes]
  );

  const autoFolderCode = useMemo(
    () => generateNextCode(formData.assemblyNodes, selectedParentNodeId),
    [formData.assemblyNodes, selectedParentNodeId]
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

  const handleTitleChange = useCallback(
    (value: string) => {
      handleFieldChange('title', value);
    },
    [handleFieldChange]
  );

  const handleExternalCommentsChange = useCallback(
    (value: string) => {
      handleFieldChange('externalComments', value);
    },
    [handleFieldChange]
  );

  const handleMarginPercentageChange = useCallback(
    (value: number) => {
      handleFieldChange('marginPercentage', value);
    },
    [handleFieldChange]
  );

  const handleUpdateMargin = useCallback(
    async (marginPercentage: number) => {
      const request: UpdateAssemblyMarginRequest = {
        budgetId: formData.id,
        versionId: formData.activeVersionId,
        marginPercentage,
      };
      await onUpdateMargin(request);
    },
    [formData.id, onUpdateMargin]
  );

  const handleInternalCommentsChange = useCallback(
    (value: string) => {
      handleFieldChange('internalComments', value);
    },
    [handleFieldChange]
  );

  const saveBudget = useCallback(async () => {
    const request: UpdateAssemblyBudgetRequest = {
      id: formData.id,
      versionId: formData.activeVersionId,
      title: formData.title,
      externalComments: formData.externalComments,
      internalComments: formData.internalComments,
      status: formData.status,
      validUntil: formData.validUntil,
      marginPercentage: formData.marginPercentage,
      assemblyNodes: formData.assemblyNodes || [],
    };
    return onUpdate(request);
  }, [formData, onUpdate]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || isReadOnly) return;

    setIsSubmitting(true);
    try {
      const updated = await saveBudget();
      if (updated) {
        setSuccessMessage(t('assemblyBudget.updated.successfully'));
        setTimeout(() => setSuccessMessage(undefined), 3000);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, isReadOnly, saveBudget, t]);

  const handleOpenFolderModal = useCallback((parentNodeId?: string) => {
    setSelectedParentNodeId(parentNodeId);
    setIsFolderModalOpen(true);
  }, []);

  const handleOpenArticleModal = useCallback(
    (parentNodeId?: string) => {
      const resolvedParent = parentNodeId ?? findFirstFolderId(formData.assemblyNodes);
      setSelectedParentNodeId(resolvedParent);
      setIsArticleModalOpen(true);
    },
    [formData.assemblyNodes]
  );

  const handleArticleParentChange = useCallback(
    (newParentId: string | undefined) => {
      setSelectedParentNodeId(newParentId);
    },
    []
  );

  const handleAddFolder = useCallback(
    async (code: string, description: string) => {
      await saveBudget();
      const request: AddAssemblyFolderRequest = {
        budgetId: formData.id,
        versionId: formData.activeVersionId,
        parentNodeId: selectedParentNodeId,
        code,
        description,
      };
      const updated = await onAddFolder(request);
      if (updated) {
        setIsFolderModalOpen(false);
      }
    },
    [formData.id, formData.activeVersionId, selectedParentNodeId, onAddFolder, saveBudget]
  );

  const handleAddArticle = useCallback(
    async (article: Article, quantity: number, marginPercentage: number, unitPrice: number) => {
      await saveBudget();
      const request: AddAssemblyArticleRequest = {
        budgetId: formData.id,
        versionId: formData.activeVersionId,
        parentNodeId: selectedParentNodeId,
        articleId: article.id,
        quantity,
        unitPrice,
        marginPercentage,
        code: generateNextCode(formData.assemblyNodes || [], selectedParentNodeId),
      };
      const updated = await onAddArticle(request);
      if (updated) {
        setIsArticleModalOpen(false);
      }
    },
    [formData.id, formData.activeVersionId, selectedParentNodeId, onAddArticle, saveBudget]
  );

  const handleDuplicateNode = useCallback(
    async (node: AssemblyNode) => {
      if (isReadOnly) return;

      const sourceNodes = formData.assemblyNodes || [];
      const sourceNode = findNodeByIdInTree(sourceNodes, node.id);
      if (!sourceNode) return;

      let workingNodes = sourceNodes;

      const duplicateBranch = async (
        source: AssemblyNode,
        parentNodeId?: string
      ): Promise<string | undefined> => {
        const previousNodes = workingNodes;

        if (source.nodeType === BudgetNodeType.Folder) {
          const sourceFolder = source as AssemblyFolder;
          const createdFolderBudget = await onAddFolder({
            budgetId: formData.id,
            versionId: formData.activeVersionId,
            parentNodeId,
            code: generateNextCode(previousNodes, parentNodeId),
            description: sourceFolder.description,
          });

          if (!createdFolderBudget?.assemblyNodes) return undefined;

          workingNodes = createdFolderBudget.assemblyNodes;
          const createdFolderId = getInsertedNodeId(
            previousNodes,
            workingNodes
          );
          if (!createdFolderId) return undefined;

          for (const child of sourceFolder.children || []) {
            const createdChildId = await duplicateBranch(child, createdFolderId);
            if (!createdChildId) return undefined;
          }

          return createdFolderId;
        }

        const sourceArticle = source as AssemblyArticle;
        const createdArticleBudget = await onAddArticle({
          budgetId: formData.id,
          versionId: formData.activeVersionId,
          parentNodeId,
          articleId: sourceArticle.articleId,
          quantity: sourceArticle.quantity,
          unitPrice: sourceArticle.unitPrice,
          marginPercentage: sourceArticle.marginPercentage,   
          code: generateNextCode(previousNodes, parentNodeId),
        });

        if (!createdArticleBudget?.assemblyNodes) return undefined;

        workingNodes = createdArticleBudget.assemblyNodes;
        return getInsertedNodeId(previousNodes, workingNodes);
      };

      const sourceParentId = findParentIdInTree(sourceNodes, sourceNode.id);
      await duplicateBranch(sourceNode, sourceParentId);
    },
    [isReadOnly, formData.id, formData.assemblyNodes, onAddFolder, onAddArticle]
  );

  const handleArticleCreated = useCallback(
    async (article?: Article) => {
      setIsCreateArticleOpen(false);
      await fetchArticles();
      if (article) {
        setPreSelectedArticle(article);
      }
      setIsArticleModalOpen(true);
    },
    [fetchArticles]
  );

  const handleCancel = useCallback(() => {
    router.push(routes.assemblyBudget.list);
  }, [router, routes.assemblyBudget.list]);

  const handleCloseFolderModal = useCallback(() => {
    setIsFolderModalOpen(false);
  }, []);

  const handleCloseArticleModal = useCallback(() => {
    setIsArticleModalOpen(false);
    setPreSelectedArticle(undefined);
  }, []);

  const handleOpenCreateArticle = useCallback(() => {
    setEditingArticle(undefined);
    setIsArticleModalOpen(false);
    setIsCreateArticleOpen(true);
  }, []);

  const handleEditArticle = useCallback(
    (article: Article) => {
      setEditingArticle(article);
      setIsArticleModalOpen(false);
      setIsCreateArticleOpen(true);
    },
    []
  );

  const handleCancelCreateArticle = useCallback(() => {
    setIsCreateArticleOpen(false);
    setEditingArticle(undefined);
  }, []);

  const handleOpenMarginModal = useCallback(() => {
    setIsMarginModalOpen(true);
  }, []);

  const handleCloseMarginModal = useCallback(() => {
    setIsMarginModalOpen(false);
  }, []);

  const handleOpenVersionsModal = useCallback(() => {
    setIsVersionsModalOpen(true);
  }, []);

  const handleCloseVersionsModal = useCallback(() => {
    setIsVersionsModalOpen(false);
    onRefreshBudget();
  }, [onRefreshBudget]);

  const handleVersionRestored = useCallback(
    (restoredBudget: Budget) => {
      setFormData(restoredBudget);
    },
    []
  );

  const handleVersionPreview = useCallback(
    (budget: Budget) => {
      setFormData(budget);
      setIsVersionsModalOpen(false);
    },
    []
  );

  const applyMarginToNodes = useCallback(
    (
      nodes: AssemblyNode[],
      changesMap: Map<string, number>
    ): AssemblyNode[] => {
      return nodes.map(node => {
        if (node.nodeType === BudgetNodeType.ArticleItem) {
          const newMargin = changesMap.get(node.id);
          if (newMargin !== undefined) {
            const article = node as AssemblyArticle;
            const base = article.quantity * article.unitPrice;
            return {
              ...article,
              marginPercentage: newMargin,
              totalAmount: calculateTotalWithMargin(base, newMargin),
            };
          }
          return node;
        }
        if (node.nodeType === BudgetNodeType.Folder) {
          const folder = node as AssemblyFolder;
          const updatedChildren = applyMarginToNodes(
            folder.children,
            changesMap
          );
          const folderTotal = updatedChildren.reduce(
            (sum, child) => sum + child.totalAmount,
            0
          );
          return {
            ...folder,
            children: updatedChildren,
            totalAmount: folderTotal,
          };
        }
        return node;
      });
    },
    []
  );

  const handleApplyMargin = useCallback(
    (changes: MarginChange[]) => {
      if (changes.length === 0) return;

      const changesMap = new Map(
        changes.map(c => [c.articleNodeId, c.marginPercentage])
      );

      setFormData(prev => {
        const updatedNodes = applyMarginToNodes(
          prev.assemblyNodes || [],
          changesMap
        );

        const newSubtotal = updatedNodes.reduce(
          (sum, node) => sum + node.totalAmount,
          0
        );

        return {
          ...prev,
          assemblyNodes: updatedNodes,
          subtotal: newSubtotal,
        };
      });

      setIsMarginModalOpen(false);
    },
    [applyMarginToNodes]
  );

  return (
    <div className="min-h-screen bg-gray-50/80">
      <div className="px-4 py-6 space-y-4">
        <AssemblyBudgetHeader
          budget={formData}
          isReadOnly={isReadOnly}
          onStatusChange={handleStatusChange}
          onValidUntilChange={handleValidUntilChange}
          onTitleChange={handleTitleChange}
          onMarginPercentageChange={handleMarginPercentageChange}
          onUpdateMargin={handleUpdateMargin}
          onOpenMarginModal={handleOpenMarginModal}
          onOpenVersionsModal={handleOpenVersionsModal}
          t={t}
        />

        <AssemblyTreePanel
          nodes={formData.assemblyNodes}
          nodeStats={nodeStats}
          isReadOnly={isReadOnly}
          budgetId={formData.id}
          versionId={formData.activeVersionId}
          onAddFolder={handleOpenFolderModal}
          onAddArticle={handleOpenArticleModal}
          onReorganizeNodes={onReorganizeNodes}
          onRemoveNode={onRemoveNode}
          onUpdateNode={onUpdateNode}
          onDuplicateNode={handleDuplicateNode}
          t={t}
        />

        <AssemblyBudgetTotalsCard budget={formData} t={t} />

        <AssemblyBudgetCommentsPanel
          externalComments={formData.externalComments}
          internalComments={formData.internalComments}
          isReadOnly={isReadOnly}
          onExternalChange={handleExternalCommentsChange}
          onInternalChange={handleInternalCommentsChange}
          t={t}
        />

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
        autoCode={autoFolderCode}
        onClose={handleCloseFolderModal}
        onConfirm={handleAddFolder}
        t={t}
      />

      <AddArticleModal
        isVisible={isArticleModalOpen}
        articles={articles}
        nodes={formData.assemblyNodes || []}
        selectedParentNodeId={selectedParentNodeId}
        onParentChange={handleArticleParentChange}
        onClose={handleCloseArticleModal}
        onConfirm={handleAddArticle}
        onCreateNew={handleOpenCreateArticle}
        onEditArticle={handleEditArticle}
        initialArticle={preSelectedArticle}
        t={t}
      />

      <ArticleFormModal
        isVisible={isCreateArticleOpen}
        initialData={editingArticle}
        onSuccess={handleArticleCreated}
        onCancel={handleCancelCreateArticle}
      />

      <ApplyMarginModal
        isVisible={isMarginModalOpen}
        nodes={formData.assemblyNodes || []}
        onClose={handleCloseMarginModal}
        onApply={handleApplyMargin}
        t={t}
      />

      <BudgetVersionsModal
        isVisible={isVersionsModalOpen}
        budgetId={formData.id}
        onClose={handleCloseVersionsModal}
        onVersionRestored={handleVersionRestored}
        onVersionPreview={handleVersionPreview}
        t={t}
      />
    </div>
  );
}
