'use client';

import { useCallback, useMemo, useState } from 'react';
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
} from 'lucide-react';

interface AssemblyNodeSelectorProps {
  nodes: AssemblyNode[];
  allNodeIds: string[];
  selectAllLabel: string;
  selectNoneLabel: string;
  countLabel: (selected: number, total: number) => string;
  onChange: (selectedIds: string[]) => void;
}

function getChildIds(node: AssemblyNode): string[] {
  const ids: string[] = [node.id];
  if (node.nodeType === BudgetNodeType.Folder) {
    for (const child of (node as AssemblyFolder).children || []) {
      ids.push(...getChildIds(child));
    }
  }
  return ids;
}

function getFolderState(
  node: AssemblyFolder,
  selected: Set<string>
): 'all' | 'some' | 'none' {
  if (selected.has(node.id)) return 'all';
  const childIds = getChildIds(node).filter(id => id !== node.id);
  return childIds.some(id => selected.has(id)) ? 'some' : 'none';
}

function buildAncestorMap(nodes: AssemblyNode[]): Map<string, string[]> {
  const ancestorMap = new Map<string, string[]>();

  const walk = (items: AssemblyNode[], ancestors: string[]) => {
    for (const node of items) {
      ancestorMap.set(node.id, ancestors);
      if (node.nodeType === BudgetNodeType.Folder) {
        walk((node as AssemblyFolder).children || [], [...ancestors, node.id]);
      }
    }
  };

  walk(nodes, []);
  return ancestorMap;
}

export function AssemblyNodeSelector({
  nodes,
  allNodeIds,
  selectAllLabel,
  selectNoneLabel,
  countLabel,
  onChange,
}: AssemblyNodeSelectorProps) {
  const ancestorMap = useMemo(() => buildAncestorMap(nodes), [nodes]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(allNodeIds)
  );
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
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
  });

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  }, []);

  const toggleNode = useCallback(
    (node: AssemblyNode) => {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(node.id)) {
          next.delete(node.id);
        } else {
          next.add(node.id);
          (ancestorMap.get(node.id) || []).forEach(id => next.add(id));
        }
        const ids = Array.from(next);
        onChange(ids);
        return next;
      });
    },
    [ancestorMap, onChange]
  );

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(allNodeIds));
    onChange(allNodeIds);
  }, [allNodeIds, onChange]);

  const handleSelectNone = useCallback(() => {
    setSelectedIds(new Set());
    onChange([]);
  }, [onChange]);

  const selectedCount = useMemo(
    () => allNodeIds.filter(id => selectedIds.has(id)).length,
    [allNodeIds, selectedIds]
  );

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">
          {countLabel(selectedCount, allNodeIds.length)}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium"
          >
            {selectAllLabel}
          </button>
          <button
            type="button"
            onClick={handleSelectNone}
            className="text-xs px-3 py-1.5 rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
          >
            {selectNoneLabel}
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-y-auto max-h-64 px-2 py-1.5">
        <NodeTree
          nodes={nodes}
          selectedIds={selectedIds}
          expandedFolders={expandedFolders}
          onToggleNode={toggleNode}
          onToggleFolder={toggleFolder}
          depth={0}
        />
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
