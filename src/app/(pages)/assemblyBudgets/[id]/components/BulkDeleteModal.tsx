'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AssemblyFolder,
  AssemblyNode,
  BudgetNodeType,
} from 'app/interfaces/Budget';
import { Button } from 'designSystem/Button/Buttons';
import { Modal2 } from 'designSystem/Modals/Modal';
import {
  AlertTriangle,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  FolderClosed,
  FolderOpen,
  Square,
  Trash2,
  Wrench,
} from 'lucide-react';

interface BulkDeleteModalProps {
  isVisible: boolean;
  nodes: AssemblyNode[];
  onClose: () => void;
  onDelete: (nodeIds: string[]) => void;
  t: (key: string) => string;
}

function collectAllNodeIds(nodes: AssemblyNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    ids.push(node.id);
    if (node.nodeType === BudgetNodeType.Folder) {
      ids.push(...collectAllNodeIds((node as AssemblyFolder).children || []));
    }
  }
  return ids;
}

function collectDirectNodeIds(nodes: AssemblyNode[]): string[] {
  return nodes.map(n => n.id);
}

function countSelectedItems(
  nodes: AssemblyNode[],
  selectedIds: Set<string>
): { folders: number; articles: number } {
  let folders = 0;
  let articles = 0;
  for (const node of nodes) {
    if (!selectedIds.has(node.id)) continue;
    if (node.nodeType === BudgetNodeType.Folder) {
      folders++;
    } else {
      articles++;
    }
  }
  return { folders, articles };
}

function filterTopLevelSelected(
  nodes: AssemblyNode[],
  selectedIds: Set<string>
): string[] {
  const result: string[] = [];
  for (const node of nodes) {
    if (selectedIds.has(node.id)) {
      result.push(node.id);
    } else if (node.nodeType === BudgetNodeType.Folder) {
      result.push(
        ...filterTopLevelSelected(
          (node as AssemblyFolder).children || [],
          selectedIds
        )
      );
    }
  }
  return result;
}

export function BulkDeleteModal({
  isVisible,
  nodes,
  onClose,
  onDelete,
  t,
}: BulkDeleteModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allNodeIds = useMemo(() => collectAllNodeIds(nodes), [nodes]);

  useEffect(() => {
    if (isVisible) {
      setSelectedIds(new Set());
    }
  }, [isVisible]);

  const handleToggleNode = useCallback((nodeId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const handleToggleFolder = useCallback(
    (folderNode: AssemblyFolder) => {
      const folderIds = collectAllNodeIds(folderNode.children || []);
      const idsToToggle = [folderNode.id, ...folderIds];
      setSelectedIds(prev => {
        const next = new Set(prev);
        const allSelected = idsToToggle.every(id => next.has(id));
        if (allSelected) {
          idsToToggle.forEach(id => next.delete(id));
        } else {
          idsToToggle.forEach(id => next.add(id));
        }
        return next;
      });
    },
    []
  );

  const handleToggleAll = useCallback(() => {
    setSelectedIds(prev => {
      if (prev.size === allNodeIds.length) {
        return new Set();
      }
      return new Set(allNodeIds);
    });
  }, [allNodeIds]);

  const handleConfirmDelete = useCallback(() => {
    const topLevelIds = filterTopLevelSelected(nodes, selectedIds);
    onDelete(topLevelIds);
  }, [nodes, selectedIds, onDelete]);

  const selectedCount = selectedIds.size;
  const allSelected = selectedCount === allNodeIds.length && allNodeIds.length > 0;
  const hasSelection = selectedCount > 0;

  const topLevelToDelete = useMemo(
    () => filterTopLevelSelected(nodes, selectedIds),
    [nodes, selectedIds]
  );

  const selectionSummary = useMemo(
    () => countSelectedItems(nodes, new Set(topLevelToDelete)),
    [nodes, topLevelToDelete]
  );

  const isEmpty = !nodes || nodes.length === 0;

  return (
    <Modal2
      isVisible={isVisible}
      setIsVisible={onClose}
      type="center"
      width="w-full max-w-2xl"
      height="h-auto"
      className="overflow-hidden flex flex-col shadow-2xl"
      closeOnEsc
    >
      <div className="flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b bg-red-50">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 text-white rounded-lg w-9 h-9 flex items-center justify-center">
              <Trash2 className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {t('assemblyBudget.bulkDelete.title')}
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {t('assemblyBudget.bulkDelete.selectItems')} ({selectedCount}/{allNodeIds.length})
            </span>
            <button
              type="button"
              onClick={handleToggleAll}
              className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
            >
              {allSelected ? (
                <CheckSquare className="h-3.5 w-3.5" />
              ) : (
                <Square className="h-3.5 w-3.5" />
              )}
              {allSelected
                ? t('assemblyBudget.margin.deselectAll')
                : t('assemblyBudget.margin.selectAll')}
            </button>
          </div>

          {isEmpty ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              {t('assemblyBudget.bulkDelete.noItems')}
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[340px] overflow-y-auto">
              {nodes.map(node => (
                <DeleteNodeRow
                  key={node.id}
                  node={node}
                  depth={0}
                  selectedIds={selectedIds}
                  onToggleNode={handleToggleNode}
                  onToggleFolder={handleToggleFolder}
                />
              ))}
            </div>
          )}

          {hasSelection && (
            <div className="bg-red-50 rounded-lg border border-red-200 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-medium text-red-700">
                <AlertTriangle className="h-4 w-4" />
                {t('assemblyBudget.bulkDelete.warning')}
              </div>
              <div className="text-sm text-red-600 pl-6 space-y-0.5">
                {selectionSummary.folders > 0 && (
                  <p>
                    {selectionSummary.folders}{' '}
                    {t('assemblyBudget.bulkDelete.folders')}
                  </p>
                )}
                {selectionSummary.articles > 0 && (
                  <p>
                    {selectionSummary.articles}{' '}
                    {t('assemblyBudget.bulkDelete.articles')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button type="cancel" onClick={onClose} customStyles="px-4 py-2">
            {t('common.cancel')}
          </Button>
          <Button
            type="delete"
            onClick={handleConfirmDelete}
            customStyles="px-4 py-2 gap-2 flex items-center"
            disabled={!hasSelection}
          >
            <Trash2 className="h-4 w-4" />
            {t('assemblyBudget.bulkDelete.confirm')} ({topLevelToDelete.length})
          </Button>
        </div>
      </div>
    </Modal2>
  );
}

interface DeleteNodeRowProps {
  node: AssemblyNode;
  depth: number;
  selectedIds: Set<string>;
  onToggleNode: (id: string) => void;
  onToggleFolder: (folder: AssemblyFolder) => void;
}

function DeleteNodeRow({
  node,
  depth,
  selectedIds,
  onToggleNode,
  onToggleFolder,
}: DeleteNodeRowProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isFolder = node.nodeType === BudgetNodeType.Folder;

  if (isFolder) {
    const folder = node as AssemblyFolder;
    const folderIds = [folder.id, ...collectAllNodeIds(folder.children || [])];
    const allChildrenSelected = folderIds.every(id => selectedIds.has(id));
    const someChildrenSelected =
      folderIds.some(id => selectedIds.has(id)) && !allChildrenSelected;

    return (
      <>
        <div
          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-red-50/60 border-b border-gray-100 ${
            allChildrenSelected ? 'bg-red-50/30' : ''
          }`}
          style={{ paddingLeft: `${16 + depth * 24}px` }}
        >
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onToggleFolder(folder)}
            className="shrink-0"
          >
            {allChildrenSelected ? (
              <CheckSquare className="h-4 w-4 text-red-600" />
            ) : someChildrenSelected ? (
              <div className="relative">
                <Square className="h-4 w-4 text-red-400" />
                <div className="absolute inset-0.5 m-auto w-2 h-0.5 bg-red-400 rounded-full" />
              </div>
            ) : (
              <Square className="h-4 w-4 text-gray-300" />
            )}
          </button>

          <div className="shrink-0">
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-amber-500" />
            ) : (
              <FolderClosed className="h-4 w-4 text-amber-500" />
            )}
          </div>

          <span className="text-xs font-mono text-gray-400 shrink-0">
            {node.code}
          </span>
          <span className="text-sm font-semibold text-gray-800 truncate flex-1">
            {node.description}
          </span>
          <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
            {collectDirectNodeIds(folder.children || []).length}
          </span>
        </div>

        {isExpanded &&
          folder.children?.map(child => (
            <DeleteNodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedIds={selectedIds}
              onToggleNode={onToggleNode}
              onToggleFolder={onToggleFolder}
            />
          ))}
      </>
    );
  }

  const isSelected = selectedIds.has(node.id);

  return (
    <div
      onClick={() => onToggleNode(node.id)}
      className={`flex items-center gap-3 py-2.5 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
        isSelected ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-gray-50'
      }`}
      style={{ paddingLeft: `${40 + depth * 24}px`, paddingRight: '16px' }}
    >
      <div className="shrink-0">
        {isSelected ? (
          <CheckSquare className="h-4 w-4 text-red-600" />
        ) : (
          <Square className="h-4 w-4 text-gray-300" />
        )}
      </div>

      <Wrench className="h-3.5 w-3.5 text-blue-500 shrink-0" />
      <span className="text-xs font-mono text-gray-400 shrink-0">
        {node.code}
      </span>
      <span className="text-sm text-gray-800 truncate flex-1">
        {node.description}
      </span>
    </div>
  );
}
