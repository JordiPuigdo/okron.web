'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  CollisionDetection,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AssemblyArticle,
  AssemblyFolder,
  AssemblyNode,
  AssemblyNodeStructureDto,
  Budget,
  BudgetNodeType,
  RemoveAssemblyNodeRequest,
  ReorganizeAssemblyNodesRequest,
  UpdateAssemblyNodeRequest,
} from 'app/interfaces/Budget';
import { formatCurrencyServerSider } from 'app/utils/utils';
import { Button } from 'designSystem/Button/Buttons';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  FileText,
  FolderClosed,
  FolderOpen,
  FolderPlus,
  GripVertical,
  Package,
  Pencil,
  Plus,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';

import { ArticlePreviewModal } from './ArticlePreviewModal';
import { NodeStats } from './AssemblyBudgetStatusConfig';
import {
  calculateFolderMargin,
  calculateMove,
  DropPosition,
  findNodeById,
  flattenNodeIds,
  getSiblingsAndIndex,
  resolveDropPosition,
} from './assemblyTreeDndUtils';

const MEASURING_CONFIG = {
  droppable: { strategy: MeasuringStrategy.Always },
};

const POINTER_SENSOR_OPTIONS = {
  activationConstraint: { distance: 5 },
};

type MoveDirection = 'up' | 'down';
const DESCRIPTION_WORD_LIMIT = 40;

function truncateDescriptionWords(description?: string): string {
  if (!description?.trim()) return '';
  const words = description.trim().split(/\s+/).filter(Boolean);
  if (words.length <= DESCRIPTION_WORD_LIMIT) {
    return description.trim();
  }
  return `${words.slice(0, DESCRIPTION_WORD_LIMIT).join(' ')}...`;
}

function shouldShowDescriptionDialog(description?: string): boolean {
  if (!description?.trim()) return false;
  const words = description.trim().split(/\s+/).filter(Boolean);
  return words.length > DESCRIPTION_WORD_LIMIT;
}

function calculateAmountWithMargin(
  baseAmount: number,
  marginPercentage: number
): number {
  const divisor = 1 - marginPercentage / 100;
  if (divisor <= 0) return baseAmount;
  return baseAmount / divisor;
}

function parseLocaleNumber(rawValue: string, fallback = 0): number {
  const trimmed = rawValue.trim();
  if (!trimmed) return 0;

  let normalized = trimmed.replace(/\s+/g, '');
  const hasComma = normalized.includes(',');
  const hasDot = normalized.includes('.');

  if (hasComma && hasDot) {
    const lastCommaIndex = normalized.lastIndexOf(',');
    const lastDotIndex = normalized.lastIndexOf('.');

    // Use the right-most separator as decimal separator.
    if (lastCommaIndex > lastDotIndex) {
      normalized = normalized.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = normalized.replace(/,/g, '');
    }
  } else if (hasComma) {
    normalized = normalized.replace(',', '.');
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatNumberForEditing(value: number): string {
  return Number.isFinite(value) ? String(value) : '';
}

function sanitizeDecimalInput(rawValue: string): string {
  return rawValue.replace(/[^\d.,\s]/g, '');
}

function calculateArticleDisplayTotal(article: AssemblyArticle): number {
  const articleSubtotal = article.quantity * article.unitPrice;
  return calculateAmountWithMargin(articleSubtotal, article.marginPercentage);
}

function calculateNodeDisplayTotal(node: AssemblyNode): number {
  if (node.nodeType === BudgetNodeType.ArticleItem) {
    return calculateArticleDisplayTotal(node as AssemblyArticle);
  }

  const folder = node as AssemblyFolder;
  return (folder.children || []).reduce(
    (sum, child) => sum + calculateNodeDisplayTotal(child),
    0
  );
}

function nodesToStructure(
  nodes: AssemblyNode[]
): AssemblyNodeStructureDto[] {
  return nodes.map((node, index) => {
    const dto: AssemblyNodeStructureDto = {
      id: node.id,
      nodeType: node.nodeType,
      sortOrder: index,
    };

    if (node.nodeType === BudgetNodeType.Folder) {
      const folder = node as AssemblyFolder;
      dto.children = nodesToStructure(folder.children || []);
    }

    return dto;
  });
}

interface AssemblyTreePanelProps {
  nodes?: AssemblyNode[];
  nodeStats: NodeStats;
  isReadOnly: boolean;
  budgetId: string;
  versionId?: string;
  onAddFolder: (parentNodeId?: string) => void;
  onAddArticle: (parentNodeId?: string) => void;
  onReorganizeNodes: (
    request: ReorganizeAssemblyNodesRequest
  ) => Promise<Budget | undefined>;
  onRemoveNode: (
    request: RemoveAssemblyNodeRequest
  ) => Promise<Budget | undefined>;
  onUpdateNode: (
    request: UpdateAssemblyNodeRequest
  ) => Promise<Budget | undefined>;
  onDuplicateNode: (node: AssemblyNode) => Promise<void>;
  t: (key: string) => string;
}



export const AssemblyTreePanel = React.memo(function AssemblyTreePanel({
  nodes,
  nodeStats,
  isReadOnly,
  budgetId,
  versionId,
  onAddFolder,
  onAddArticle,
  onReorganizeNodes,
  onRemoveNode,
  onUpdateNode,
  onDuplicateNode,
  t,
}: AssemblyTreePanelProps) {
  const isEmpty = !nodes || nodes.length === 0;
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropPosition | null>(null);
  const [optimisticNodes, setOptimisticNodes] = useState<
    AssemblyNode[] | null
  >(null);
  const [isMoving, setIsMoving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    node: AssemblyNode;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewArticleId, setPreviewArticleId] = useState<string | null>(null);

  const displayNodes = optimisticNodes || nodes;

  useEffect(() => {
    setOptimisticNodes(null);
  }, [nodes]);

  const sortableIds = useMemo(
    () => (displayNodes ? flattenNodeIds(displayNodes) : []),
    [displayNodes]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, POINTER_SENSOR_OPTIONS),
    useSensor(KeyboardSensor)
  );

  const draggedNode = useMemo(() => {
    if (!draggedNodeId || !displayNodes) return null;
    return findNodeById(displayNodes, draggedNodeId) ?? null;
  }, [draggedNodeId, displayNodes]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (isReadOnly || isMoving || isDuplicating) return;
      setDraggedNodeId(String(event.active.id));
    },
    [isReadOnly, isMoving, isDuplicating]
  );

  const getPointerCoordinates = useCallback(
    (
      event: DragOverEvent | DragMoveEvent
    ): { x: number; y: number } | null => {
      const pointerEvent = event.activatorEvent as PointerEvent | MouseEvent;
      const hasCoordinates =
        typeof pointerEvent.clientX === 'number' &&
        typeof pointerEvent.clientY === 'number';

      if (hasCoordinates) {
        return {
          x: pointerEvent.clientX + event.delta.x,
          y: pointerEvent.clientY + event.delta.y,
        };
      }

      return null;
    },
    []
  );

  const updateDropIndicator = useCallback(
    (event: DragOverEvent | DragMoveEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !displayNodes) {
        setDropIndicator(null);
        return;
      }

      const overNode = findNodeById(displayNodes, String(over.id));
      if (!overNode) {
        setDropIndicator(null);
        return;
      }

      const pointerCoordinates = getPointerCoordinates(event);
      if (!pointerCoordinates) {
        setDropIndicator(null);
        return;
      }

      const position = resolveDropPosition(
        String(over.id),
        over.rect,
        pointerCoordinates.y,
        overNode.nodeType === BudgetNodeType.Folder,
        pointerCoordinates.x
      );

      setDropIndicator(position);
    },
    [displayNodes, getPointerCoordinates]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      updateDropIndicator(event);
    },
    [updateDropIndicator]
  );

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      updateDropIndicator(event);
    },
    [updateDropIndicator]
  );

  const collisionDetection = useMemo<CollisionDetection>(
    () => args => {
      const pointerCollisions = pointerWithin(args);

      if (pointerCollisions.length > 0) {
        return pointerCollisions;
      }

      return closestCenter(args);
    },
    []
  );

  const persistNodeMove = useCallback(
    async (
      moveResult: {
        optimisticNodes: AssemblyNode[];
      }
    ) => {
      setOptimisticNodes(moveResult.optimisticNodes);
      setIsMoving(true);

      let shouldKeepOptimistic = false;
      try {
        const result = await onReorganizeNodes({
          budgetId,
          versionId,
          assemblyNodes: nodesToStructure(moveResult.optimisticNodes),
        });
        shouldKeepOptimistic = !result;
      } catch {
        setOptimisticNodes(null);
      } finally {
        if (!shouldKeepOptimistic) {
          setOptimisticNodes(null);
        }
        setIsMoving(false);
      }
    },
    [onReorganizeNodes, budgetId]
  );

  const canMoveNode = useCallback(
    (nodeId: string, direction: MoveDirection) => {
      if (!displayNodes) return false;
      const siblingData = getSiblingsAndIndex(displayNodes, nodeId);
      if (!siblingData) return false;

      return direction === 'up'
        ? siblingData.index > 0
        : siblingData.index < siblingData.siblings.length - 1;
    },
    [displayNodes]
  );

  const handleMoveNodeByOffset = useCallback(
    async (nodeId: string, direction: MoveDirection) => {
      if (isReadOnly || isMoving || !displayNodes) return;

      const siblingData = getSiblingsAndIndex(displayNodes, nodeId);
      if (!siblingData) return;

      const targetIndex =
        direction === 'up' ? siblingData.index - 1 : siblingData.index + 1;
      if (targetIndex < 0 || targetIndex >= siblingData.siblings.length) {
        return;
      }

      const targetNodeId = siblingData.siblings[targetIndex].id;
      const moveResult = calculateMove(displayNodes, nodeId, {
        targetNodeId,
        position: direction === 'up' ? 'before' : 'after',
      });

      if (!moveResult) return;

      await persistNodeMove(moveResult);
    },
    [isReadOnly, isMoving, displayNodes, persistNodeMove]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const activeId = String(event.active.id);

      if (!dropIndicator || !displayNodes) {
        setDraggedNodeId(null);
        setDropIndicator(null);
        return;
      }

      const moveResult = calculateMove(displayNodes, activeId, dropIndicator);

      setDraggedNodeId(null);
      setDropIndicator(null);

      if (!moveResult) return;

      await persistNodeMove(moveResult);
    },
    [dropIndicator, displayNodes, persistNodeMove]
  );

  const handleDragCancel = useCallback(() => {
    setDraggedNodeId(null);
    setDropIndicator(null);
  }, []);

  const handleRequestDelete = useCallback(
    (node: AssemblyNode) => {
      if (isReadOnly) return;
      setDeleteConfirm({ node });
    },
    [isReadOnly]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirm || isDeleting) return;

    setIsDeleting(true);
    try {
      await onRemoveNode({
        budgetId,
        versionId,
        nodeId: deleteConfirm.node.id,
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, isDeleting, onRemoveNode, budgetId]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirm(null);
  }, []);

  const handleDuplicateRequest = useCallback(
    async (node: AssemblyNode) => {
      if (isReadOnly || isMoving || isDuplicating) return;

      setIsDuplicating(true);
      try {
        await onDuplicateNode(node);
      } finally {
        setIsDuplicating(false);
      }
    },
    [isReadOnly, isMoving, isDuplicating, onDuplicateNode]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[600px]">
      <TreePanelHeader
        nodeStats={nodeStats}
        isEmpty={isEmpty}
        isReadOnly={isReadOnly}
        onAddFolder={onAddFolder}
        onAddArticle={onAddArticle}
        t={t}
      />

      {isEmpty ? (
        <TreeEmptyState
          isReadOnly={isReadOnly}
          onAddFolder={onAddFolder}
          onAddArticle={onAddArticle}
          t={t}
        />
      ) : (
        <DndContext
          sensors={isReadOnly ? undefined : sensors}
          collisionDetection={collisionDetection}
          measuring={MEASURING_CONFIG}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={sortableIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex-1 overflow-auto px-2 py-2">
              <TreeColumnHeader t={t} />
              <div className="min-w-0 w-full">
                {displayNodes?.map((node, index) => (
                  <TreeNode
                    key={node.id}
                    node={node}
                    depth={0}
                    isLast={index === (displayNodes?.length || 0) - 1}
                    parentLines={[]}
                    isReadOnly={isReadOnly}
                    onAddFolder={onAddFolder}
                    onAddArticle={onAddArticle}
                    onRequestDelete={handleRequestDelete}
                    draggedNodeId={draggedNodeId}
                    dropIndicator={dropIndicator}
                    onUpdateNode={onUpdateNode}
                    budgetId={budgetId}
                    versionId={versionId}
                    isMoving={isMoving}
                    isDuplicating={isDuplicating}
                    canMoveNode={canMoveNode}
                    onMoveNodeByOffset={handleMoveNodeByOffset}
                    onDuplicateNode={handleDuplicateRequest}
                    onPreviewArticle={setPreviewArticleId}
                    t={t}
                  />
                ))}
              </div>
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={null}>
            {draggedNode ? (
              <DragOverlayContent node={draggedNode} />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <DeleteConfirmDialog
        node={deleteConfirm?.node ?? null}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        t={t}
      />

      <ArticlePreviewModal
        articleId={previewArticleId}
        onClose={() => setPreviewArticleId(null)}
      />
    </div>
  );
});

function TreePanelHeader({
  nodeStats,
  isEmpty,
  isReadOnly,
  onAddFolder,
  onAddArticle,
  t,
}: {
  nodeStats: NodeStats;
  isEmpty: boolean;
  isReadOnly: boolean;
  onAddFolder: (parentNodeId?: string) => void;
  onAddArticle: (parentNodeId?: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="bg-amber-50 text-amber-600 rounded-lg w-9 h-9 flex items-center justify-center">
          <Package className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">
            {t('assemblyBudget.nodes')}
          </h2>
          {!isEmpty && (
            <p className="text-xs text-gray-400">
              {nodeStats.folders} {t('folders')} · {nodeStats.articles}{' '}
              {t('articles')}
            </p>
          )}
        </div>
      </div>

      {!isReadOnly && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAddFolder()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            {t('assemblyBudget.addFolder')}
          </button>
          <button
            type="button"
            onClick={() => onAddArticle()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            {t('assemblyBudget.addArticle')}
          </button>
        </div>
      )}
    </div>
  );
}

function TreeEmptyState({
  isReadOnly,
  onAddFolder,
  onAddArticle,
  t,
}: {
  isReadOnly: boolean;
  onAddFolder: (parentNodeId?: string) => void;
  onAddArticle: (parentNodeId?: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-gray-300 py-16">
      <Package className="h-16 w-16 mb-4 opacity-40" />
      <p className="text-base font-medium">
        {t('assemblyBudget.nodes.empty')}
      </p>
      <p className="text-sm mt-1">{t('assemblyBudget.nodes.empty.hint')}</p>
      {!isReadOnly && (
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={() => onAddFolder()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
          >
            <FolderPlus className="h-4 w-4" />
            {t('assemblyBudget.addFolder')}
          </button>
          <button
            type="button"
            onClick={() => onAddArticle()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t('assemblyBudget.addArticle')}
          </button>
        </div>
      )}
    </div>
  );
}

interface TreeNodeProps {
  node: AssemblyNode;
  depth: number;
  isLast: boolean;
  parentLines: boolean[];
  isReadOnly: boolean;
  onAddFolder: (parentNodeId?: string) => void;
  onAddArticle: (parentNodeId?: string) => void;
  onRequestDelete: (node: AssemblyNode) => void;
  draggedNodeId: string | null;
  dropIndicator: DropPosition | null;
  onUpdateNode: (
    request: UpdateAssemblyNodeRequest
  ) => Promise<Budget | undefined>;
  budgetId: string;
  versionId?: string;
  isMoving: boolean;
  isDuplicating: boolean;
  canMoveNode: (nodeId: string, direction: MoveDirection) => boolean;
  onMoveNodeByOffset: (
    nodeId: string,
    direction: MoveDirection
  ) => Promise<void>;
  onDuplicateNode: (node: AssemblyNode) => Promise<void>;
  onPreviewArticle: (articleId: string) => void;
  t: (key: string) => string;
}

function TreeNode({
  node,
  depth,
  isLast,
  parentLines,
  isReadOnly,
  onAddFolder,
  onAddArticle,
  onRequestDelete,
  draggedNodeId,
  dropIndicator,
  onUpdateNode,
  budgetId,
  versionId,
  isMoving,
  isDuplicating,
  canMoveNode,
  onMoveNodeByOffset,
  onDuplicateNode,
  onPreviewArticle,
  t,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSecondary, setIsEditingSecondary] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isSavingDescription, setIsSavingDescription] = useState(false);
  const [editValue, setEditValue] = useState(node.description);
  const [editSecondaryValue, setEditSecondaryValue] = useState(node.secondaryDescription);
  const [isEditingArticle, setIsEditingArticle] = useState(false);
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnitPrice, setEditUnitPrice] = useState('');
  const [editMargin, setEditMargin] = useState(0);
  const isConfirmedRef = useRef(false);
  const isSecondaryConfirmedRef = useRef(false);
  const isArticleConfirmedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const secondaryInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const isFolder = node.nodeType === BudgetNodeType.Folder;
  const folder = isFolder ? (node as AssemblyFolder) : null;
  const article = !isFolder ? (node as AssemblyArticle) : null;
  const canOpenDescription = shouldShowDescriptionDialog(node.description) || shouldShowDescriptionDialog(node.secondaryDescription);
  const collapsedDescription = truncateDescriptionWords(node.description);
  const collapsedSecondaryDescription = truncateDescriptionWords(node.secondaryDescription);
  const hasSecondaryDescription = node.secondaryDescription?.trim().length > 0;

  const isDragging = draggedNodeId === node.id;
  const isDropTarget = dropIndicator?.targetNodeId === node.id;
  const dropPosition = isDropTarget ? dropIndicator.position : null;

  const canMoveUp = canMoveNode(node.id, 'up');
  const canMoveDown = canMoveNode(node.id, 'down');
  const isMoveDisabled =
    isReadOnly || isMoving || isDuplicating || isEditing || isEditingSecondary || isEditingArticle;
  const canDuplicate = !isReadOnly && !isMoving && !isDuplicating && !isEditing && !isEditingSecondary && !isEditingArticle;
  const canDrag = !isReadOnly && !isDuplicating && !isEditing && !isEditingSecondary && !isEditingArticle;

  const {
    attributes,
    listeners,
    setDroppableNodeRef,
    setDraggableNodeRef,
    transform,
    transition,
  } = useSortable({
    id: node.id,
    disabled: !canDrag,
  });

  const style = useMemo(() => ({
    transform: CSS.Translate.toString(transform),
    transition,
  }), [transform, transition]);

  const childLines = useMemo(
    () => [...parentLines, !isLast],
    [parentLines, isLast]
  );

  const handleStartEditing = useCallback(
    (e: React.MouseEvent) => {
      if (isReadOnly) return;
      e.stopPropagation();
      setEditValue(node.description);
      setIsEditing(true);
      requestAnimationFrame(() => inputRef.current?.select());
    },
    [isReadOnly, node.description]
  );

  const handleCancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditValue(node.description);
    isConfirmedRef.current = false;
  }, [node.description]);

  const handleConfirmEditing = useCallback(async () => {
    if (isConfirmedRef.current) return;
    isConfirmedRef.current = true;

    const trimmed = editValue.trim();
    if (!trimmed || trimmed === node.description) {
      handleCancelEditing();
      return;
    }
    setIsEditing(false);
    await onUpdateNode({
      budgetId,
      versionId,
      nodeId: node.id,
      description: trimmed,
    });
    isConfirmedRef.current = false;
  }, [editValue, node.description, node.id, budgetId, versionId, onUpdateNode, handleCancelEditing]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirmEditing();
      } else if (e.key === 'Escape') {
        handleCancelEditing();
      }
    },
    [handleConfirmEditing, handleCancelEditing]
  );

  const handleStartSecondaryEditing = useCallback(
    (e: React.MouseEvent) => {
      if (isReadOnly) return;
      e.stopPropagation();
      setEditSecondaryValue(node.secondaryDescription);
      setIsEditingSecondary(true);
      requestAnimationFrame(() => secondaryInputRef.current?.select());
    },
    [isReadOnly, node.secondaryDescription]
  );

  const handleCancelSecondaryEditing = useCallback(() => {
    setIsEditingSecondary(false);
    setEditSecondaryValue(node.secondaryDescription);
    isSecondaryConfirmedRef.current = false;
  }, [node.secondaryDescription]);

  const handleConfirmSecondaryEditing = useCallback(async () => {
    if (isSecondaryConfirmedRef.current) return;
    isSecondaryConfirmedRef.current = true;

    const trimmed = editSecondaryValue.trim();
    if (trimmed === node.secondaryDescription) {
      handleCancelSecondaryEditing();
      return;
    }
    setIsEditingSecondary(false);
    await onUpdateNode({
      budgetId,
      versionId,
      nodeId: node.id,
      secondaryDescription: trimmed,
    });
    isSecondaryConfirmedRef.current = false;
  }, [editSecondaryValue, node.secondaryDescription, node.id, budgetId, versionId, onUpdateNode, handleCancelSecondaryEditing]);

  const handleSecondaryEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirmSecondaryEditing();
      } else if (e.key === 'Escape') {
        handleCancelSecondaryEditing();
      }
    },
    [handleConfirmSecondaryEditing, handleCancelSecondaryEditing]
  );

  const handleStartArticleEditing = useCallback(
    (e: React.MouseEvent) => {
      if (isReadOnly || !article) return;
      e.stopPropagation();
      setEditQuantity(formatNumberForEditing(article.quantity));
      setEditUnitPrice(formatNumberForEditing(article.unitPrice));
      setEditMargin(article.marginPercentage);
      setIsEditingArticle(true);
      requestAnimationFrame(() => quantityInputRef.current?.select());
    },
    [isReadOnly, article]
  );

  const handleCancelArticleEditing = useCallback(() => {
    setIsEditingArticle(false);
    isArticleConfirmedRef.current = false;
  }, []);

  const handleConfirmArticleEditing = useCallback(async () => {
    if (isArticleConfirmedRef.current || !article) return;
    isArticleConfirmedRef.current = true;

    const qty = parseLocaleNumber(editQuantity, Number.NaN);
    const price = parseLocaleNumber(editUnitPrice, Number.NaN);
    const margin = Number(editMargin);

    if (
      !Number.isFinite(qty) ||
      !Number.isFinite(price) ||
      !Number.isFinite(margin)
    ) {
      handleCancelArticleEditing();
      return;
    }

    const hasChanges =
      qty !== article.quantity ||
      price !== article.unitPrice ||
      margin !== article.marginPercentage;

    if (!hasChanges || qty <= 0 || price < 0 || margin < 0) {
      handleCancelArticleEditing();
      return;
    }

    setIsEditingArticle(false);
    await onUpdateNode({
      budgetId,
      versionId,
      nodeId: node.id,
      quantity: qty,
      unitPrice: price,
      marginPercentage: margin,
    });
    isArticleConfirmedRef.current = false;
  }, [
    editQuantity,
    editUnitPrice,
    editMargin,
    article,
    budgetId,
    node.id,
    onUpdateNode,
    handleCancelArticleEditing,
  ]);

  const handleArticleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirmArticleEditing();
      } else if (e.key === 'Escape') {
        handleCancelArticleEditing();
      }
    },
    [handleConfirmArticleEditing, handleCancelArticleEditing]
  );

  const handleSaveDescription = useCallback(
    async (description: string, secondaryDescription?: string): Promise<boolean> => {
      const trimmedDesc = description.trim();
      const trimmedSecondary = secondaryDescription?.trim();

      if (!trimmedDesc) return false;

      const descChanged = trimmedDesc !== node.description;
      const secondaryChanged = trimmedSecondary !== undefined && trimmedSecondary !== node.secondaryDescription;

      if (!descChanged && !secondaryChanged) {
        setIsDescriptionOpen(false);
        return true;
      }

      setIsSavingDescription(true);
      try {
        const result = await onUpdateNode({
          budgetId,
          versionId,
          nodeId: node.id,
          ...(descChanged && { description: trimmedDesc }),
          ...(secondaryChanged && { secondaryDescription: trimmedSecondary }),
        });

        if (result) {
          setIsDescriptionOpen(false);
          return true;
        }

        return false;
      } finally {
        setIsSavingDescription(false);
      }
    },
    [budgetId, versionId, node.id, node.description, node.secondaryDescription, onUpdateNode]
  );

  return (
    <div ref={setDraggableNodeRef} style={style} className="relative">
      {dropPosition === 'before' && <DropLine />}

      <div
        ref={setDroppableNodeRef}
        className={`group flex items-center min-h-14 py-2 rounded-lg transition-all duration-150 ${
          isDragging
            ? 'opacity-40 scale-[0.98]'
            : isFolder
            ? 'hover:bg-amber-50/60'
            : 'hover:bg-blue-50/50'
        } ${
          dropPosition === 'inside'
            ? 'bg-amber-100 ring-2 ring-amber-400 ring-inset rounded-lg shadow-[inset_0_0_12px_rgba(245,158,11,0.15)]'
            : dropPosition === 'before'
            ? 'bg-gradient-to-b from-blue-50 to-transparent'
            : dropPosition === 'after'
            ? 'bg-gradient-to-t from-blue-50 to-transparent'
            : ''
        }`}
        onClick={() => !isEditing && !isEditingArticle && isFolder && setIsExpanded(!isExpanded)}
      >
        <TreeIndent parentLines={parentLines} isLast={isLast} />

        {!isReadOnly && (
          <div
            className="flex items-center shrink-0 mr-1 opacity-40 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        )}

        {isFolder ? (
          <FolderIcon isExpanded={isExpanded} />
        ) : (
          <div className="flex items-center shrink-0 mr-2 pl-[22px]">
            <Wrench className="h-4 w-4 text-blue-500" />
          </div>
        )}

        <div className="min-w-[150px] shrink-0 mr-2">
          <span className="block text-sm font-mono text-gray-400">
            {node.code}
          </span>
        </div>

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={handleConfirmEditing}
            onClick={e => e.stopPropagation()}
            className="flex-1 text-sm font-semibold text-gray-800 bg-white border border-amber-400 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-amber-500 min-w-0"
          />
        ) : isEditingSecondary ? (
          <input
            ref={secondaryInputRef}
            type="text"
            value={editSecondaryValue}
            onChange={e => setEditSecondaryValue(e.target.value)}
            onKeyDown={handleSecondaryEditKeyDown}
            onBlur={handleConfirmSecondaryEditing}
            onClick={e => e.stopPropagation()}
            className="flex-1 text-xs text-gray-500 bg-white border border-blue-300 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-blue-400 min-w-0"
          />
        ) : (
          <div className="flex-1 min-w-0 flex flex-col gap-1 py-0.5">
            <div className="flex items-start gap-1">
              <span
                className={`flex-1 min-w-0 overflow-hidden break-words [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] ${
                  isFolder
                    ? 'text-base font-semibold text-gray-800 cursor-text hover:text-amber-700'
                    : 'text-sm text-gray-700 cursor-text hover:text-blue-700'
                }`}
                title={node.description}
              onDoubleClick={handleStartEditing}
            >
              {collapsedDescription}
            </span>
            {canOpenDescription && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setIsDescriptionOpen(true);
                }}
                className="shrink-0 p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                title="View full description"
              >
                <FileText className="h-3.5 w-3.5" />
              </button>
            )}
            </div>
            <div className="min-h-[16px]">
              {hasSecondaryDescription && (
                <span
                  className="block text-xs text-gray-500 min-w-0 overflow-hidden break-words [display:-webkit-box] [-webkit-line-clamp:1] [-webkit-box-orient:vertical] cursor-text hover:text-blue-500"
                  title={node.secondaryDescription}
                  onDoubleClick={handleStartSecondaryEditing}
                >
                  {collapsedSecondaryDescription}
                </span>
              )}
              {!hasSecondaryDescription && !isReadOnly && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setEditSecondaryValue('');
                    setIsEditingSecondary(true);
                    requestAnimationFrame(() => secondaryInputRef.current?.focus());
                  }}
                  className="text-xs text-gray-300 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  + {t('assemblyBudget.field.secondaryDescription')}
                </button>
              )}
              {!hasSecondaryDescription && isReadOnly && (
                <span className="text-xs text-gray-300">-</span>
              )}
            </div>
          </div>
        )}

        {isFolder && !isReadOnly && (
          <FolderActions
            nodeId={node.id}
            onAddFolder={onAddFolder}
            onAddArticle={onAddArticle}
            onDelete={() => onRequestDelete(node)}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            isMoveDisabled={isMoveDisabled}
            onMoveUp={() => onMoveNodeByOffset(node.id, 'up')}
            onMoveDown={() => onMoveNodeByOffset(node.id, 'down')}
            onDuplicate={() => onDuplicateNode(node)}
            canDuplicate={canDuplicate}
          />
        )}

        {article && !isReadOnly && (
          <div className="flex items-center gap-0.5 mr-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onPreviewArticle(article.articleId);
              }}
              className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
              title={t('article.preview')}
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onDuplicateNode(node);
              }}
              disabled={!canDuplicate}
              className="p-1.5 rounded hover:bg-violet-100 text-gray-400 hover:text-violet-600 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              title="Duplicate"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onMoveNodeByOffset(node.id, 'up');
              }}
              disabled={isMoveDisabled || !canMoveUp}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              title="Move up"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onMoveNodeByOffset(node.id, 'down');
              }}
              disabled={isMoveDisabled || !canMoveDown}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              title="Move down"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleStartArticleEditing}
              className="p-1.5 rounded hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onRequestDelete(node);
              }}
              className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {article && (
          <ArticleAmounts
            article={article}
            isEditing={isEditingArticle}
            editQuantity={editQuantity}
            editUnitPrice={editUnitPrice}
            editMargin={editMargin}
            onQuantityChange={setEditQuantity}
            onUnitPriceChange={setEditUnitPrice}
            onMarginChange={setEditMargin}
            onKeyDown={handleArticleEditKeyDown}
            onConfirm={handleConfirmArticleEditing}
            onCancel={handleCancelArticleEditing}
            quantityInputRef={quantityInputRef}
          />
        )}

        {isFolder && folder && (
          <FolderAmounts
            folder={folder}
            totalAmount={calculateNodeDisplayTotal(node)}
          />
        )}
      </div>

      {dropPosition === 'after' && !isFolder && <DropLine />}

      {isFolder && isExpanded && folder?.children && (
        <div>
          {folder.children.map((child, index) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              isLast={index === folder.children.length - 1}
              parentLines={childLines}
              isReadOnly={isReadOnly}
              onAddFolder={onAddFolder}
              onAddArticle={onAddArticle}
              onRequestDelete={onRequestDelete}
              draggedNodeId={draggedNodeId}
              dropIndicator={dropIndicator}
              onUpdateNode={onUpdateNode}
              budgetId={budgetId}
              versionId={versionId}
              isMoving={isMoving}
              isDuplicating={isDuplicating}
              canMoveNode={canMoveNode}
              onMoveNodeByOffset={onMoveNodeByOffset}
              onDuplicateNode={onDuplicateNode}
              onPreviewArticle={onPreviewArticle}
              t={t}
            />
          ))}
        </div>
      )}

      {dropPosition === 'after' && isFolder && <DropLine />}

      <DescriptionDialog
        isOpen={isDescriptionOpen}
        title={node.description}
        secondaryDescription={node.secondaryDescription}
        subtitle={node.code}
        onClose={() => setIsDescriptionOpen(false)}
        canEdit={!isReadOnly}
        isSaving={isSavingDescription}
        onSave={handleSaveDescription}
        t={t}
      />
    </div>
  );
}

function DragOverlayContent({ node }: { node: AssemblyNode }) {
  const isFolder = node.nodeType === BudgetNodeType.Folder;
  const article = !isFolder ? (node as AssemblyArticle) : null;

  return (
    <div className={`flex items-center h-12 px-4 rounded-xl shadow-2xl border-2 bg-white ${
      isFolder ? 'border-amber-400' : 'border-blue-400'
    }`}>
      <GripVertical className="h-4 w-4 text-gray-300 mr-2 shrink-0" />
      {isFolder ? (
        <FolderClosed className="h-4 w-4 text-amber-500 mr-2 shrink-0" />
      ) : (
        <Wrench className="h-4 w-4 text-blue-500 mr-2 shrink-0" />
      )}
      <span className="text-sm font-mono text-gray-400 mr-2 shrink-0">
        {node.code}
      </span>
      <div className="flex flex-col min-w-0 max-w-[300px]">
        <span className={`text-sm truncate ${
          isFolder ? 'font-semibold text-gray-800' : 'text-gray-700'
        }`}>
          {node.description}
        </span>
        {node.secondaryDescription?.trim() && (
          <span className="text-xs truncate text-gray-400">
            {node.secondaryDescription}
          </span>
        )}
      </div>
      {article && (
        <span className="text-sm font-semibold text-gray-900 ml-4 shrink-0">
          {formatCurrencyServerSider(calculateArticleDisplayTotal(article))}
        </span>
      )}
    </div>
  );
}

function DropLine() {
  return (
    <div className="relative h-0 z-20">
      <div className="absolute left-4 right-4 h-[3px] bg-blue-500 rounded-full shadow-md shadow-blue-200" />
      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-blue-500 rounded-full ring-2 ring-blue-200 shadow-sm" />
    </div>
  );
}

function FolderIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0 mr-2">
      <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </span>
      {isExpanded ? (
        <FolderOpen className="h-[18px] w-[18px] text-amber-500" />
      ) : (
        <FolderClosed className="h-[18px] w-[18px] text-amber-500" />
      )}
    </div>
  );
}

function FolderActions({
  nodeId,
  onAddFolder,
  onAddArticle,
  onDelete,
  canMoveUp,
  canMoveDown,
  isMoveDisabled,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  canDuplicate,
}: {
  nodeId: string;
  onAddFolder: (parentNodeId?: string) => void;
  onAddArticle: (parentNodeId?: string) => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isMoveDisabled: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  canDuplicate: boolean;
}) {
  return (
    <div className="flex items-center gap-1 mr-2 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          onMoveUp();
        }}
        disabled={isMoveDisabled || !canMoveUp}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        title="Move up"
      >
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          onMoveDown();
        }}
        disabled={isMoveDisabled || !canMoveDown}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        title="Move down"
      >
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          onDuplicate();
        }}
        disabled={!canDuplicate}
        className="p-1.5 rounded hover:bg-violet-100 text-gray-400 hover:text-violet-600 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        title="Duplicate"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          onAddFolder(nodeId);
        }}
        className="p-1.5 rounded hover:bg-amber-100 text-amber-600 transition-colors"
      >
        <FolderPlus className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          onAddArticle(nodeId);
        }}
        className="p-1.5 rounded hover:bg-blue-100 text-blue-600 transition-colors"
      >
        <Plus className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function ArticleAmounts({
  article,
  isEditing,
  editQuantity,
  editUnitPrice,
  editMargin,
  onQuantityChange,
  onUnitPriceChange,
  onMarginChange,
  onKeyDown,
  onConfirm,
  onCancel,
  quantityInputRef,
}: {
  article: AssemblyArticle;
  isEditing: boolean;
  editQuantity: string;
  editUnitPrice: string;
  editMargin: number;
  onQuantityChange: (v: string) => void;
  onUnitPriceChange: (v: string) => void;
  onMarginChange: (v: number) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onConfirm: () => void;
  onCancel: () => void;
  quantityInputRef: React.RefObject<HTMLInputElement>;
}) {
  if (isEditing) {
    return (
      <div
        className="flex items-center shrink-0 pr-3"
        onClick={e => e.stopPropagation()}
      >
        <span className="w-[50px] text-right">
          <input
            ref={quantityInputRef}
            type="text"
            inputMode="decimal"
            value={editQuantity}
            onChange={e => onQuantityChange(sanitizeDecimalInput(e.target.value))}
            onBlur={e => {
              const parsed = parseLocaleNumber(e.target.value, Number.NaN);
              if (Number.isFinite(parsed)) {
                onQuantityChange(formatNumberForEditing(parsed));
              }
            }}
            onKeyDown={onKeyDown}
            className="w-full text-sm text-right border border-blue-400 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-blue-500 tabular-nums"
          />
        </span>
        <span className="w-[80px] text-right">
          <input
            type="text"
            inputMode="decimal"
            value={editUnitPrice}
            onChange={e => onUnitPriceChange(sanitizeDecimalInput(e.target.value))}
            onBlur={e => {
              const parsed = parseLocaleNumber(e.target.value, Number.NaN);
              if (Number.isFinite(parsed)) {
                onUnitPriceChange(formatNumberForEditing(parsed));
              }
            }}
            onKeyDown={onKeyDown}
            className="w-full text-sm text-right border border-blue-400 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-blue-500 tabular-nums"
          />
        </span>
        <span className="w-[100px]" />
        <span className="w-[55px] flex items-center justify-center gap-1">
          <span className="text-xs text-gray-400">+</span>
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={editMargin}
            onChange={e =>
              onMarginChange(parseLocaleNumber(e.target.value, editMargin))
            }
            onKeyDown={onKeyDown}
            className="w-[42px] text-sm text-right border border-blue-400 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-blue-500 tabular-nums"
          />
          <span className="text-xs text-gray-400">%</span>
        </span>
        <span className="w-[85px]" />
        <span className="w-[100px] flex items-center justify-end gap-0.5">
          <button
            type="button"
            onClick={onConfirm}
            className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded hover:bg-gray-200 text-gray-400 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </span>
      </div>
    );
  }

  const articleSubtotal = article.quantity * article.unitPrice;
  const articleTotalWithMargin = calculateArticleDisplayTotal(article);
  const articleFinalUnitPrice =
    article.quantity > 0
      ? articleTotalWithMargin / article.quantity
      : article.unitPrice;

  return (
    <div className="flex items-center shrink-0 pr-3">
      <span className="w-[50px] text-right text-xs text-gray-400 tabular-nums">
        {article.quantity}
      </span>
      <span className="w-[80px] text-right text-xs text-gray-400 tabular-nums">
        {formatCurrencyServerSider(article.unitPrice)}
      </span>
      <span className="w-[100px] text-right">
        <span className="text-[11px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-md tabular-nums">
          {formatCurrencyServerSider(articleSubtotal)}
        </span>
      </span>
      <span className="w-[55px] text-center">
        {article.marginPercentage > 0 && (
          <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
            +{article.marginPercentage}%
          </span>
        )}
      </span>
      <span className="w-[85px] text-right">
        <span className="text-[11px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md tabular-nums">
          {formatCurrencyServerSider(articleFinalUnitPrice)}
        </span>
      </span>
      <span className="w-[100px] text-right text-sm font-semibold text-gray-900 tabular-nums">
        {formatCurrencyServerSider(articleTotalWithMargin)}
      </span>
    </div>
  );
}

function FolderAmounts({
  folder,
  totalAmount,
}: {
  folder: AssemblyFolder;
  totalAmount: number;
}) {
  const totalWithoutMargin = calculateFolderMargin(
    folder.children || []
  ).baseSubtotal;
  const calculatedMarginPercentage =
    totalAmount > 0 && totalWithoutMargin > 0
      ? Math.round(
          ((1 - totalWithoutMargin / totalAmount) * 100 + Number.EPSILON) * 100
        ) / 100
      : 0;

  return (
    <div className="flex items-center shrink-0 pr-3">
      <span className="w-[50px] text-right">
        <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {folder.children.length}
        </span>
      </span>
      <span className="w-[80px] text-right text-[11px] text-gray-300 tabular-nums">
        -
      </span>
      <span className="w-[100px] text-right">
        <span className="text-[11px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-md tabular-nums">
          {formatCurrencyServerSider(totalWithoutMargin)}
        </span>
      </span>
      <span className="w-[55px] text-center">
        {calculatedMarginPercentage > 0 && (
          <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md tabular-nums">
            +{calculatedMarginPercentage}%
          </span>
        )}
      </span>
      <span className="w-[85px]" />
      <span className="w-[100px] text-right text-sm font-bold text-gray-900 tabular-nums">
        {formatCurrencyServerSider(totalAmount)}
      </span>
    </div>
  );
}

function TreeColumnHeader({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex items-center min-h-8 px-1 mb-1 border-b border-gray-100">
      <div className="flex-1 min-w-0" />
      <div className="flex items-center shrink-0 pr-3">
        <span className="w-[50px] text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider">
          {t('quantity')}
        </span>
        <span className="w-[80px] text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider">
          {t('price')}
        </span>
        <span className="w-[100px] text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider">
          {t('assemblyBudget.column.subtotal')}
        </span>
        <span className="w-[55px] text-center text-[11px] font-medium text-gray-400 uppercase tracking-wider">
          {t('assemblyBudget.column.margin')}
        </span>
        <span className="w-[85px] text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider">
          {t('assemblyBudget.column.unitPrice')}
        </span>
        <span className="w-[100px] text-right text-[11px] font-medium text-gray-400 uppercase tracking-wider">
          {t('assemblyBudget.column.total')}
        </span>
      </div>
    </div>
  );
}

function TreeIndent({
  parentLines,
  isLast,
}: {
  parentLines: boolean[];
  isLast: boolean;
}) {
  return (
    <div className="flex items-center h-full shrink-0">
      {parentLines.map((showLine, i) => (
        <div
          key={i}
          className="w-6 h-full relative flex items-center justify-center"
        >
          {showLine && (
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-200" />
          )}
        </div>
      ))}
      <div className="w-6 h-full relative flex items-center justify-center">
        {parentLines.length > 0 && (
          <>
            <div
              className={`absolute left-1/2 w-px bg-gray-200 ${
                isLast ? 'top-0 h-1/2' : 'top-0 bottom-0'
              }`}
            />
            <div className="absolute left-1/2 top-1/2 w-3 h-px bg-gray-200" />
          </>
        )}
      </div>
    </div>
  );
}

function DeleteConfirmDialog({
  node,
  isDeleting,
  onConfirm,
  onCancel,
  t,
}: {
  node: AssemblyNode | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  t: (key: string) => string;
}) {
  if (!node) return null;

  const isFolder = node.nodeType === BudgetNodeType.Folder;
  const folder = isFolder ? (node as AssemblyFolder) : null;
  const childCount = folder?.children?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-red-100 text-red-600 rounded-full w-10 h-10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900">
                {isFolder
                  ? t('assemblyBudget.delete.folder.title')
                  : t('assemblyBudget.delete.article.title')}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {isFolder
                  ? t('assemblyBudget.delete.folder.message')
                  : t('assemblyBudget.delete.article.message')}
              </p>

              <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2">
                  {isFolder ? (
                    <FolderClosed className="h-4 w-4 text-amber-500 shrink-0" />
                  ) : (
                    <Wrench className="h-4 w-4 text-blue-500 shrink-0" />
                  )}
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {node.description}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 ml-6">
                  {node.code} Â· {node.id}
                  {isFolder && childCount > 0 && (
                    <span className="text-red-500 font-medium">
                      {' '}
                      · {childCount}{' '}
                      {t('assemblyBudget.delete.folder.children')}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button
            type="cancel"
            onClick={onCancel}
            customStyles="px-4 py-2"
            disabled={isDeleting}
          >
            {t('common.cancel')}
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            {t('delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

function DescriptionDialog({
  isOpen,
  title,
  secondaryDescription,
  subtitle,
  onClose,
  canEdit = false,
  isSaving = false,
  onSave,
  t,
}: {
  isOpen: boolean;
  title: string;
  secondaryDescription: string;
  subtitle?: string;
  onClose: () => void;
  canEdit?: boolean;
  isSaving?: boolean;
  onSave?: (value: string, secondaryDescription?: string) => Promise<boolean>;
  t: (key: string) => string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const [editSecondaryValue, setEditSecondaryValue] = useState(secondaryDescription);

  useEffect(() => {
    if (!isOpen) return;
    setIsEditing(false);
    setEditValue(title);
    setEditSecondaryValue(secondaryDescription);
  }, [isOpen, title, secondaryDescription]);

  const handleStartEdit = useCallback(() => {
    if (!canEdit) return;
    setIsEditing(true);
  }, [canEdit]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditValue(title);
    setEditSecondaryValue(secondaryDescription);
  }, [title, secondaryDescription]);

  const handleSave = useCallback(async () => {
    if (!onSave || isSaving) return;
    const saved = await onSave(editValue, editSecondaryValue);
    if (saved) {
      setIsEditing(false);
    }
  }, [onSave, isSaving, editValue, editSecondaryValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={() => {
          if (!isSaving) onClose();
        }}
      />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500 shrink-0" />
            <h3 className="text-sm font-semibold text-gray-900">
              {isEditing ? t('assemblyBudget.field.editDescriptions') : t('assemblyBudget.field.fullDescriptions')}
            </h3>
            {subtitle && (
              <span className="text-xs text-gray-400 font-mono">{subtitle}</span>
            )}
          </div>
        </div>

        <div className="px-6 py-5 max-h-[60vh] overflow-auto space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              {t('assemblyBudget.field.internalDescription')}
            </label>
            {isEditing ? (
              <textarea
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className="w-full min-h-[140px] text-sm text-gray-700 leading-6 whitespace-pre-wrap break-words border border-amber-300 rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 resize-y"
                disabled={isSaving}
              />
            ) : (
              <p className="text-sm text-gray-700 leading-6 whitespace-pre-wrap break-words">
                {title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              {t('assemblyBudget.field.externalDescription')}
            </label>
            {isEditing ? (
              <textarea
                value={editSecondaryValue}
                onChange={e => setEditSecondaryValue(e.target.value)}
                className="w-full min-h-[140px] text-sm text-gray-700 leading-6 whitespace-pre-wrap break-words border border-blue-300 rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 resize-y"
                disabled={isSaving}
              />
            ) : (
              <p className="text-sm text-gray-500 leading-6 whitespace-pre-wrap break-words">
                {secondaryDescription || '-'}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? t('common.saving') : t('common.save')}
              </button>
            </>
          ) : (
            <>
              {canEdit && (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  {t('common.edit')}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {t('common.close')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
