'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  AssemblyFolder,
  AssemblyNode,
  BudgetNodeType,
} from 'app/interfaces/Budget';
import { formatCurrencyServerSider } from 'app/utils/utils';
import {
  Check,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Minus,
  Package,
  Printer,
} from 'lucide-react';

interface NodeSelectionModalProps {
  isVisible: boolean;
  nodes: AssemblyNode[];
  allNodeIds: string[];
  onConfirm: (selectedIds: string[]) => void;
}

function getChildIds(node: AssemblyNode): string[] {
  const ids: string[] = [node.id];
  if (node.nodeType === BudgetNodeType.Folder) {
    const folder = node as AssemblyFolder;
    for (const child of folder.children || []) {
      ids.push(...getChildIds(child));
    }
  }
  return ids;
}

function getFolderState(
  node: AssemblyFolder,
  selected: Set<string>
): 'all' | 'some' | 'none' {
  const childIds = getChildIds(node).filter(id => id !== node.id);
  if (childIds.length === 0) return selected.has(node.id) ? 'all' : 'none';

  const selectedCount = childIds.filter(id => selected.has(id)).length;
  if (selectedCount === childIds.length) return 'all';
  if (selectedCount > 0) return 'some';
  return 'none';
}

export function NodeSelectionModal({
  isVisible,
  nodes,
  allNodeIds,
  onConfirm,
}: NodeSelectionModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(allNodeIds)
  );
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    () => {
      const folderIds = new Set<string>();
      const walk = (items: AssemblyNode[]) => {
        for (const node of items) {
          if (node.nodeType === BudgetNodeType.Folder) {
            folderIds.add(node.id);
            walk((node as AssemblyFolder).children || []);
          }
        }
      };
      walk(nodes);
      return folderIds;
    }
  );

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  const toggleNode = useCallback((node: AssemblyNode) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      const ids = getChildIds(node);
      const allSelected = ids.every(id => next.has(id));

      if (allSelected) {
        ids.forEach(id => next.delete(id));
      } else {
        ids.forEach(id => next.add(id));
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(allNodeIds));
  }, [allNodeIds]);

  const handleSelectNone = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectedCount = useMemo(() => {
    return allNodeIds.filter(id => selectedIds.has(id)).length;
  }, [allNodeIds, selectedIds]);

  const handleConfirm = useCallback(() => {
    onConfirm(Array.from(selectedIds));
  }, [selectedIds, onConfirm]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Printer className="h-5 w-5 text-blue-600" />
            Selecciona els elements a imprimir
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {selectedCount} de {allNodeIds.length} elements seleccionats
          </p>
        </div>

        <div className="px-6 py-2 flex gap-2 border-b border-gray-100">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium"
          >
            Seleccionar tot
          </button>
          <button
            type="button"
            onClick={handleSelectNone}
            className="text-xs px-3 py-1.5 rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
          >
            Deseleccionar tot
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-3">
          <NodeTree
            nodes={nodes}
            selectedIds={selectedIds}
            expandedFolders={expandedFolders}
            onToggleNode={toggleNode}
            onToggleFolder={toggleFolder}
            depth={0}
          />
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedCount === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="h-4 w-4" />
            Imprimir ({selectedCount})
          </button>
        </div>
      </div>
    </div>
  );
}

function NodeTree({
  nodes,
  selectedIds,
  expandedFolders,
  onToggleNode,
  onToggleFolder,
  depth,
}: {
  nodes: AssemblyNode[];
  selectedIds: Set<string>;
  expandedFolders: Set<string>;
  onToggleNode: (node: AssemblyNode) => void;
  onToggleFolder: (folderId: string) => void;
  depth: number;
}) {
  return (
    <div className="space-y-0.5">
      {nodes.map(node => (
        <NodeRow
          key={node.id}
          node={node}
          selectedIds={selectedIds}
          expandedFolders={expandedFolders}
          onToggleNode={onToggleNode}
          onToggleFolder={onToggleFolder}
          depth={depth}
        />
      ))}
    </div>
  );
}

function NodeRow({
  node,
  selectedIds,
  expandedFolders,
  onToggleNode,
  onToggleFolder,
  depth,
}: {
  node: AssemblyNode;
  selectedIds: Set<string>;
  expandedFolders: Set<string>;
  onToggleNode: (node: AssemblyNode) => void;
  onToggleFolder: (folderId: string) => void;
  depth: number;
}) {
  const isFolder = node.nodeType === BudgetNodeType.Folder;
  const folder = isFolder ? (node as AssemblyFolder) : null;
  const isExpanded = isFolder && expandedFolders.has(node.id);

  const isSelected = selectedIds.has(node.id);
  const folderState = folder ? getFolderState(folder, selectedIds) : null;
  const checkState = isFolder ? folderState : isSelected ? 'all' : 'none';

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
        onClick={() => onToggleNode(node)}
      >
        {isFolder && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onToggleFolder(node.id);
            }}
            className="p-0.5 text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}

        {!isFolder && <div className="w-5" />}

        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            checkState === 'all'
              ? 'bg-blue-600 border-blue-600'
              : checkState === 'some'
                ? 'bg-blue-200 border-blue-400'
                : 'border-gray-300'
          }`}
        >
          {checkState === 'all' && <Check className="h-3 w-3 text-white" />}
          {checkState === 'some' && <Minus className="h-3 w-3 text-blue-700" />}
        </div>

        {isFolder ? (
          <FolderOpen className="h-4 w-4 text-amber-500 shrink-0" />
        ) : (
          <Package className="h-4 w-4 text-blue-500 shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-800 truncate block">
            {node.code} — {node.description}
          </span>
          {node.secondaryDescription && (
            <span className="text-xs text-gray-400 truncate block">
              {node.secondaryDescription}
            </span>
          )}
        </div>

        <span className="text-xs text-gray-500 tabular-nums shrink-0">
          {formatCurrencyServerSider(node.totalAmount)}
        </span>
      </div>

      {isFolder && isExpanded && folder?.children && (
        <NodeTree
          nodes={folder.children}
          selectedIds={selectedIds}
          expandedFolders={expandedFolders}
          onToggleNode={onToggleNode}
          onToggleFolder={onToggleFolder}
          depth={depth + 1}
        />
      )}
    </div>
  );
}
