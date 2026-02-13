'use client';

import React, { useMemo, useState } from 'react';
import {
  AssemblyArticle,
  AssemblyFolder,
  AssemblyNode,
  BudgetNodeType,
} from 'app/interfaces/Budget';
import { formatCurrencyServerSider } from 'app/utils/utils';
import {
  ChevronDown,
  ChevronRight,
  FolderClosed,
  FolderOpen,
  FolderPlus,
  Package,
  Plus,
  Wrench,
} from 'lucide-react';

import { NodeStats } from './AssemblyBudgetStatusConfig';

interface AssemblyTreePanelProps {
  nodes?: AssemblyNode[];
  nodeStats: NodeStats;
  isReadOnly: boolean;
  onAddFolder: (parentNodeId?: string) => void;
  onAddArticle: (parentNodeId?: string) => void;
  t: (key: string) => string;
}

export const AssemblyTreePanel = React.memo(function AssemblyTreePanel({
  nodes,
  nodeStats,
  isReadOnly,
  onAddFolder,
  onAddArticle,
  t,
}: AssemblyTreePanelProps) {
  const isEmpty = !nodes || nodes.length === 0;

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
        <div className="flex-1 overflow-auto px-2 py-2">
          <div className="min-w-[500px]">
            {nodes.map((node, index) => (
              <TreeNode
                key={node.id}
                node={node}
                depth={0}
                isLast={index === nodes.length - 1}
                parentLines={[]}
                isReadOnly={isReadOnly}
                onAddFolder={onAddFolder}
                onAddArticle={onAddArticle}
              />
            ))}
          </div>
        </div>
      )}
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

function TreeNode({
  node,
  depth,
  isLast,
  parentLines,
  isReadOnly,
  onAddFolder,
  onAddArticle,
}: {
  node: AssemblyNode;
  depth: number;
  isLast: boolean;
  parentLines: boolean[];
  isReadOnly: boolean;
  onAddFolder: (parentNodeId?: string) => void;
  onAddArticle: (parentNodeId?: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isFolder = node.nodeType === BudgetNodeType.Folder;
  const folder = isFolder ? (node as AssemblyFolder) : null;
  const article = !isFolder ? (node as AssemblyArticle) : null;

  const childLines = useMemo(
    () => [...parentLines, !isLast],
    [parentLines, isLast]
  );

  return (
    <div>
      <div
        className={`group flex items-center h-11 rounded-lg transition-colors ${
          isFolder
            ? 'cursor-pointer hover:bg-amber-50/60'
            : 'hover:bg-blue-50/50'
        }`}
        onClick={() => isFolder && setIsExpanded(!isExpanded)}
      >
        <TreeIndent parentLines={parentLines} isLast={isLast} />

        {isFolder ? (
          <FolderIcon isExpanded={isExpanded} />
        ) : (
          <div className="flex items-center shrink-0 mr-2 pl-[22px]">
            <Wrench className="h-4 w-4 text-blue-500" />
          </div>
        )}

        <span className="text-xs font-mono text-gray-400 min-w-[70px] shrink-0">
          {node.code}
        </span>

        <span
          className={`flex-1 truncate ${
            isFolder
              ? 'text-sm font-semibold text-gray-800'
              : 'text-sm text-gray-700'
          }`}
        >
          {node.description}
        </span>

        {isFolder && !isReadOnly && (
          <FolderActions
            nodeId={node.id}
            onAddFolder={onAddFolder}
            onAddArticle={onAddArticle}
          />
        )}

        {article && <ArticleAmounts article={article} />}

        {isFolder && (
          <FolderAmounts
            childrenCount={folder?.children?.length}
            totalAmount={node.totalAmount}
          />
        )}
      </div>

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
            />
          ))}
        </div>
      )}
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
}: {
  nodeId: string;
  onAddFolder: (parentNodeId?: string) => void;
  onAddArticle: (parentNodeId?: string) => void;
}) {
  return (
    <div className="hidden group-hover:flex items-center gap-1 mr-2">
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          onAddFolder(nodeId);
        }}
        className="p-1 rounded hover:bg-amber-100 text-amber-600 transition-colors"
      >
        <FolderPlus className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          onAddArticle(nodeId);
        }}
        className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ArticleAmounts({ article }: { article: AssemblyArticle }) {
  return (
    <div className="flex items-center gap-3 ml-4 shrink-0 pr-3">
      <span className="text-xs text-gray-400 tabular-nums">
        {article.quantity} x{' '}
        {formatCurrencyServerSider(article.unitPrice)}
      </span>
      {article.marginPercentage > 0 && (
        <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
          +{article.marginPercentage}%
        </span>
      )}
      <span className="text-sm font-semibold text-gray-900 min-w-[90px] text-right tabular-nums">
        {formatCurrencyServerSider(article.totalAmount)}
      </span>
    </div>
  );
}

function FolderAmounts({
  childrenCount,
  totalAmount,
}: {
  childrenCount?: number;
  totalAmount: number;
}) {
  return (
    <div className="flex items-center gap-2 ml-4 shrink-0 pr-3">
      {childrenCount !== undefined && (
        <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {childrenCount}
        </span>
      )}
      <span className="text-sm font-bold text-gray-900 min-w-[90px] text-right tabular-nums">
        {formatCurrencyServerSider(totalAmount)}
      </span>
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
