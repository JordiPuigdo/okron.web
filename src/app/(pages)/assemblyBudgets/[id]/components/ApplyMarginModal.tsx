'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AssemblyArticle,
  AssemblyFolder,
  AssemblyNode,
  BudgetNodeType,
} from 'app/interfaces/Budget';
import { formatCurrencyServerSider } from 'app/utils/utils';
import { Button } from 'designSystem/Button/Buttons';
import { Modal2 } from 'designSystem/Modals/Modal';
import {
  Check,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  FolderClosed,
  FolderOpen,
  Percent,
  Square,
  Wrench,
} from 'lucide-react';

export interface MarginChange {
  articleNodeId: string;
  marginPercentage: number;
}

interface ApplyMarginModalProps {
  isVisible: boolean;
  nodes: AssemblyNode[];
  onClose: () => void;
  onApply: (changes: MarginChange[]) => void;
  t: (key: string) => string;
}

function collectAllArticleIds(nodes: AssemblyNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    if (node.nodeType === BudgetNodeType.ArticleItem) {
      ids.push(node.id);
    } else if (node.nodeType === BudgetNodeType.Folder) {
      ids.push(...collectAllArticleIds((node as AssemblyFolder).children || []));
    }
  }
  return ids;
}

function collectArticlesFlat(nodes: AssemblyNode[]): AssemblyArticle[] {
  const result: AssemblyArticle[] = [];
  for (const node of nodes) {
    if (node.nodeType === BudgetNodeType.ArticleItem) {
      result.push(node as AssemblyArticle);
    } else if (node.nodeType === BudgetNodeType.Folder) {
      result.push(
        ...collectArticlesFlat((node as AssemblyFolder).children || [])
      );
    }
  }
  return result;
}

export function ApplyMarginModal({
  isVisible,
  nodes,
  onClose,
  onApply,
  t,
}: ApplyMarginModalProps) {
  const [marginPercentage, setMarginPercentage] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allArticleIds = useMemo(() => collectAllArticleIds(nodes), [nodes]);
  const allArticles = useMemo(() => collectArticlesFlat(nodes), [nodes]);

  useEffect(() => {
    if (isVisible) {
      setMarginPercentage('');
      setSelectedIds(new Set(allArticleIds));
    }
  }, [isVisible, allArticleIds]);

  const parsedMargin = parseFloat(marginPercentage) || 0;

  const handleToggleArticle = useCallback((articleId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(articleId)) {
        next.delete(articleId);
      } else {
        next.add(articleId);
      }
      return next;
    });
  }, []);

  const handleToggleFolder = useCallback(
    (folderNode: AssemblyFolder) => {
      const folderArticleIds = collectAllArticleIds(
        folderNode.children || []
      );
      setSelectedIds(prev => {
        const next = new Set(prev);
        const allSelected = folderArticleIds.every(id => next.has(id));
        if (allSelected) {
          folderArticleIds.forEach(id => next.delete(id));
        } else {
          folderArticleIds.forEach(id => next.add(id));
        }
        return next;
      });
    },
    []
  );

  const handleToggleAll = useCallback(() => {
    setSelectedIds(prev => {
      if (prev.size === allArticleIds.length) {
        return new Set();
      }
      return new Set(allArticleIds);
    });
  }, [allArticleIds]);

  const handleApply = useCallback(() => {
    const changes: MarginChange[] = allArticles
      .filter(a => selectedIds.has(a.id))
      .map(a => ({
        articleNodeId: a.id,
        marginPercentage: parsedMargin,
      }));
    onApply(changes);
  }, [allArticles, selectedIds, parsedMargin, onApply]);

  const handleMarginInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
        setMarginPercentage(raw);
      }
    },
    []
  );

  const selectedCount = selectedIds.size;
  const allSelected =
    selectedCount === allArticleIds.length && allArticleIds.length > 0;
  const hasSelection = selectedCount > 0;
  const hasValidMargin = parsedMargin >= 0 && marginPercentage !== '';

  const previewTotals = useMemo(() => {
    let originalTotal = 0;
    let newTotal = 0;

    for (const article of allArticles) {
      const base = article.quantity * article.unitPrice;
      const currentMarginAmount =
        base * (article.marginPercentage / 100);
      const currentTotal = base + currentMarginAmount;

      if (selectedIds.has(article.id)) {
        const newMarginAmount = base * (parsedMargin / 100);
        originalTotal += currentTotal;
        newTotal += base + newMarginAmount;
      } else {
        originalTotal += currentTotal;
        newTotal += currentTotal;
      }
    }

    return { originalTotal, newTotal, diff: newTotal - originalTotal };
  }, [allArticles, selectedIds, parsedMargin]);

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
        <ModalHeader t={t} />

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <MarginInput
            value={marginPercentage}
            onChange={handleMarginInput}
            t={t}
          />

          <SelectionHeader
            selectedCount={selectedCount}
            totalCount={allArticleIds.length}
            allSelected={allSelected}
            onToggleAll={handleToggleAll}
            t={t}
          />

          {isEmpty ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              {t('assemblyBudget.margin.noArticles')}
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[340px] overflow-y-auto">
              {nodes.map(node => (
                <NodeRow
                  key={node.id}
                  node={node}
                  depth={0}
                  selectedIds={selectedIds}
                  parsedMargin={parsedMargin}
                  hasValidMargin={hasValidMargin}
                  onToggleArticle={handleToggleArticle}
                  onToggleFolder={handleToggleFolder}
                />
              ))}
            </div>
          )}

          {hasValidMargin && hasSelection && (
            <PreviewSummary
              previewTotals={previewTotals}
              selectedCount={selectedCount}
              t={t}
            />
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button type="cancel" onClick={onClose} customStyles="px-4 py-2">
            {t('common.cancel')}
          </Button>
          <Button
            type="create"
            onClick={handleApply}
            customStyles="px-4 py-2 gap-2 flex items-center"
            disabled={!hasSelection || !hasValidMargin}
          >
            <Check className="h-4 w-4" />
            {t('assemblyBudget.margin.apply')}
          </Button>
        </div>
      </div>
    </Modal2>
  );
}

function ModalHeader({ t }: { t: (key: string) => string }) {
  return (
    <div className="px-6 py-4 border-b bg-emerald-50">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-600 text-white rounded-lg w-9 h-9 flex items-center justify-center">
          <Percent className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          {t('assemblyBudget.margin.title')}
        </h2>
      </div>
    </div>
  );
}

function MarginInput({
  value,
  onChange,
  t,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  t: (key: string) => string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {t('assemblyBudget.margin.percentage')}
      </label>
      <div className="relative w-40">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={onChange}
          placeholder="0"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-right pr-8 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
          autoFocus
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
          %
        </span>
      </div>
    </div>
  );
}

function SelectionHeader({
  selectedCount,
  totalCount,
  allSelected,
  onToggleAll,
  t,
}: {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  onToggleAll: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">
        {t('assemblyBudget.margin.articles')} ({selectedCount}/{totalCount})
      </span>
      <button
        type="button"
        onClick={onToggleAll}
        className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
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
  );
}

interface NodeRowProps {
  node: AssemblyNode;
  depth: number;
  selectedIds: Set<string>;
  parsedMargin: number;
  hasValidMargin: boolean;
  onToggleArticle: (id: string) => void;
  onToggleFolder: (folder: AssemblyFolder) => void;
}

function NodeRow({
  node,
  depth,
  selectedIds,
  parsedMargin,
  hasValidMargin,
  onToggleArticle,
  onToggleFolder,
}: NodeRowProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isFolder = node.nodeType === BudgetNodeType.Folder;

  if (isFolder) {
    const folder = node as AssemblyFolder;
    const folderArticleIds = collectAllArticleIds(folder.children || []);
    const allChildrenSelected = folderArticleIds.every(id =>
      selectedIds.has(id)
    );
    const someChildrenSelected =
      folderArticleIds.some(id => selectedIds.has(id)) &&
      !allChildrenSelected;

    return (
      <>
        <div
          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-amber-50/60 border-b border-gray-100 ${
            allChildrenSelected ? 'bg-emerald-50/30' : ''
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
              <CheckSquare className="h-4 w-4 text-emerald-600" />
            ) : someChildrenSelected ? (
              <div className="relative">
                <Square className="h-4 w-4 text-emerald-400" />
                <div className="absolute inset-0.5 m-auto w-2 h-0.5 bg-emerald-400 rounded-full" />
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
            {folderArticleIds.length}
          </span>
          <span className="text-sm font-bold text-gray-900 min-w-[90px] text-right tabular-nums shrink-0">
            {formatCurrencyServerSider(node.totalAmount)}
          </span>
        </div>

        {isExpanded &&
          folder.children?.map(child => (
            <NodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedIds={selectedIds}
              parsedMargin={parsedMargin}
              hasValidMargin={hasValidMargin}
              onToggleArticle={onToggleArticle}
              onToggleFolder={onToggleFolder}
            />
          ))}
      </>
    );
  }

  const article = node as AssemblyArticle;
  return (
    <ArticleNodeRow
      article={article}
      depth={depth}
      isSelected={selectedIds.has(article.id)}
      parsedMargin={parsedMargin}
      hasValidMargin={hasValidMargin}
      onToggle={onToggleArticle}
    />
  );
}

function ArticleNodeRow({
  article,
  depth,
  isSelected,
  parsedMargin,
  hasValidMargin,
  onToggle,
}: {
  article: AssemblyArticle;
  depth: number;
  isSelected: boolean;
  parsedMargin: number;
  hasValidMargin: boolean;
  onToggle: (id: string) => void;
}) {
  const baseAmount = article.quantity * article.unitPrice;
  const currentMarginAmount = baseAmount * (article.marginPercentage / 100);
  const currentTotal = baseAmount + currentMarginAmount;

  const newMargin =
    isSelected && hasValidMargin ? parsedMargin : article.marginPercentage;
  const newMarginAmount = baseAmount * (newMargin / 100);
  const newTotal = baseAmount + newMarginAmount;

  const showDiff =
    isSelected && hasValidMargin && newMargin !== article.marginPercentage;

  return (
    <div
      onClick={() => onToggle(article.id)}
      className={`flex items-center gap-3 py-2.5 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
        isSelected
          ? 'bg-emerald-50/50 hover:bg-emerald-50'
          : 'hover:bg-gray-50'
      }`}
      style={{ paddingLeft: `${40 + depth * 24}px`, paddingRight: '16px' }}
    >
      <div className="shrink-0">
        {isSelected ? (
          <CheckSquare className="h-4 w-4 text-emerald-600" />
        ) : (
          <Square className="h-4 w-4 text-gray-300" />
        )}
      </div>

      <Wrench className="h-3.5 w-3.5 text-blue-500 shrink-0" />
      <span className="text-xs font-mono text-gray-400 shrink-0">
        {article.code}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 truncate">{article.description}</p>
        <p className="text-xs text-gray-400">
          {article.quantity} x {formatCurrencyServerSider(article.unitPrice)}
        </p>
      </div>

      <div className="shrink-0 text-right space-y-0.5">
        {showDiff ? (
          <>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs text-gray-400 line-through tabular-nums">
                {article.marginPercentage}%
              </span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md tabular-nums">
                {parsedMargin}%
              </span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs text-gray-400 line-through tabular-nums">
                {formatCurrencyServerSider(currentTotal)}
              </span>
              <span className="text-sm font-semibold text-gray-900 tabular-nums">
                {formatCurrencyServerSider(newTotal)}
              </span>
            </div>
          </>
        ) : (
          <>
            {article.marginPercentage > 0 && (
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md tabular-nums">
                +{article.marginPercentage}%
              </span>
            )}
            <p className="text-sm font-semibold text-gray-900 tabular-nums">
              {formatCurrencyServerSider(currentTotal)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function PreviewSummary({
  previewTotals,
  selectedCount,
  t,
}: {
  previewTotals: { originalTotal: number; newTotal: number; diff: number };
  selectedCount: number;
  t: (key: string) => string;
}) {
  const isPositive = previewTotals.diff > 0;
  const isNegative = previewTotals.diff < 0;

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">
          {t('assemblyBudget.margin.affected')} ({selectedCount})
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">
          {t('assemblyBudget.margin.currentTotal')}
        </span>
        <span className="font-medium text-gray-700 tabular-nums">
          {formatCurrencyServerSider(previewTotals.originalTotal)}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">
          {t('assemblyBudget.margin.newTotal')}
        </span>
        <span className="font-bold text-gray-900 tabular-nums">
          {formatCurrencyServerSider(previewTotals.newTotal)}
        </span>
      </div>
      {previewTotals.diff !== 0 && (
        <div className="flex justify-between text-sm border-t pt-2">
          <span className="text-gray-500">
            {t('assemblyBudget.margin.difference')}
          </span>
          <span
            className={`font-semibold tabular-nums ${
              isPositive
                ? 'text-emerald-600'
                : isNegative
                ? 'text-red-600'
                : 'text-gray-700'
            }`}
          >
            {isPositive ? '+' : ''}
            {formatCurrencyServerSider(previewTotals.diff)}
          </span>
        </div>
      )}
    </div>
  );
}
