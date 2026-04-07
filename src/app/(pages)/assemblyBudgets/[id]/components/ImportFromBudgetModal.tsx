'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import {
  AssemblyFolder,
  AssemblyNode,
  Budget,
  BudgetNodeType,
  BudgetType,
  ImportAssemblyNodesRequest,
} from 'app/interfaces/Budget';
import { BudgetAssemblyService } from 'app/services/budgetAssemblyService';
import { BudgetService } from 'app/services/budgetService';
import { Button } from 'designSystem/Button/Buttons';
import { Modal2 } from 'designSystem/Modals/Modal';
import {
  ArrowLeft,
  ArrowRight,
  Download,
  FolderOpen,
} from 'lucide-react';

import { AssemblyNodeSelector } from '../../components/AssemblyNodeSelector';

interface ImportFromBudgetModalProps {
  isVisible: boolean;
  targetBudget: Budget;
  onImport: (request: ImportAssemblyNodesRequest) => Promise<void>;
  onCancel: () => void;
}

function collectAllNodeIds(nodes: AssemblyNode[]): string[] {
  const ids: string[] = [];
  const walk = (items: AssemblyNode[]) => {
    for (const node of items) {
      ids.push(node.id);
      if (node.nodeType === BudgetNodeType.Folder) {
        walk((node as AssemblyFolder).children || []);
      }
    }
  };
  walk(nodes);
  return ids;
}

function collectFolders(nodes: AssemblyNode[]): AssemblyFolder[] {
  const folders: AssemblyFolder[] = [];
  const walk = (items: AssemblyNode[]) => {
    for (const node of items) {
      if (node.nodeType === BudgetNodeType.Folder) {
        const folder = node as AssemblyFolder;
        folders.push(folder);
        walk(folder.children || []);
      }
    }
  };
  walk(nodes);
  return folders;
}

export function ImportFromBudgetModal({
  isVisible,
  targetBudget,
  onImport,
  onCancel,
}: ImportFromBudgetModalProps) {
  const { t } = useTranslations();

  const [step, setStep] = useState<1 | 2>(1);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [searchText, setSearchText] = useState('');
  const [sourceBudget, setSourceBudget] = useState<Budget | undefined>(undefined);
  const [isLoadingBudgets, setIsLoadingBudgets] = useState(false);
  const [isLoadingSource, setIsLoadingSource] = useState(false);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [targetParentNodeId, setTargetParentNodeId] = useState<string | undefined>(undefined);
  const [keepMargins, setKeepMargins] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const budgetServiceRef = useRef(
    new BudgetService(process.env.NEXT_PUBLIC_API_BASE_URL!)
  );
  const assemblyServiceRef = useRef(
    new BudgetAssemblyService(process.env.NEXT_PUBLIC_API_BASE_URL!)
  );

  useEffect(() => {
    if (!isVisible) return;
    setStep(1);
    setSourceBudget(undefined);
    setSelectedNodeIds([]);
    setTargetParentNodeId(undefined);
    setKeepMargins(false);
    setSearchText('');
    loadBudgets();
  }, [isVisible]);

  const loadBudgets = useCallback(async () => {
    setIsLoadingBudgets(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 2);
      const all = await budgetServiceRef.current.getAll({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        budgetType: BudgetType.Assembly,
      });
      setBudgets(all);
    } catch {
      setBudgets([]);
    } finally {
      setIsLoadingBudgets(false);
    }
  }, []);

  const handleSelectBudget = useCallback(async (budget: Budget) => {
    setIsLoadingSource(true);
    try {
      const full = await assemblyServiceRef.current.getById(budget.id);
      setSourceBudget(full);
      const allIds = collectAllNodeIds(full.assemblyNodes ?? []);
      setSelectedNodeIds(allIds);
      setStep(2);
    } catch {
      console.error('Error loading source budget');
    } finally {
      setIsLoadingSource(false);
    }
  }, []);

  const handleBack = useCallback(() => {
    setStep(1);
    setSourceBudget(undefined);
  }, []);

  const handleImport = useCallback(async () => {
    if (!sourceBudget) return;
    setIsSubmitting(true);
    try {
      await onImport({
        budgetId: targetBudget.id,
        versionId: targetBudget.activeVersionId,
        sourceBudgetId: sourceBudget.id,
        sourceNodeIds: selectedNodeIds.length > 0 ? selectedNodeIds : undefined,
        targetParentNodeId: targetParentNodeId ?? undefined,
        keepMargins,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [sourceBudget, targetBudget, selectedNodeIds, targetParentNodeId, keepMargins, onImport]);

  const filteredBudgets = budgets.filter(b => {
    const text = searchText.toLowerCase();
    return (
      b.code.toLowerCase().includes(text) ||
      (b.companyName ?? '').toLowerCase().includes(text) ||
      (b.title ?? '').toLowerCase().includes(text)
    );
  });

  const targetFolders = collectFolders(targetBudget.assemblyNodes ?? []);

  return (
    <Modal2
      isVisible={isVisible}
      setIsVisible={onCancel}
      type="center"
      width="w-full max-w-2xl"
      height="h-auto max-h-[90vh]"
      className="overflow-hidden flex flex-col shadow-2xl"
      closeOnEsc
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-shrink-0 p-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white rounded-lg w-10 h-10 flex items-center justify-center">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {t('assemblyBudget.import.modalTitle')}
              </h2>
              <p className="text-sm text-gray-500">
                {step === 1
                  ? t('assemblyBudget.import.step1Title')
                  : t('assemblyBudget.import.step2Title')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {step === 1 && (
            <Step1
              budgets={filteredBudgets}
              searchText={searchText}
              isLoading={isLoadingBudgets || isLoadingSource}
              onSearchChange={setSearchText}
              onSelectBudget={handleSelectBudget}
              t={t}
            />
          )}

          {step === 2 && sourceBudget && (
            <Step2
              sourceBudget={sourceBudget}
              selectedNodeIds={selectedNodeIds}
              targetFolders={targetFolders}
              targetParentNodeId={targetParentNodeId}
              keepMargins={keepMargins}
              onNodeSelectionChange={setSelectedNodeIds}
              onTargetParentChange={setTargetParentNodeId}
              onKeepMarginsChange={setKeepMargins}
              t={t}
            />
          )}
        </div>

        <div className="flex-shrink-0 flex justify-between items-center gap-3 px-6 py-4 border-t bg-gray-50">
          <div>
            {step === 2 && (
              <Button type="cancel" onClick={handleBack} customStyles="flex items-center gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                {t('assemblyBudget.import.backButton')}
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="cancel" onClick={onCancel} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            {step === 2 && (
              <Button
                type="create"
                onClick={handleImport}
                customStyles="flex items-center gap-2"
                disabled={isSubmitting || selectedNodeIds.length === 0}
              >
                {t('assemblyBudget.import.confirmButton')}
                {isSubmitting ? (
                  <SvgSpinner className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal2>
  );
}

function Step1({
  budgets,
  searchText,
  isLoading,
  onSearchChange,
  onSelectBudget,
  t,
}: {
  budgets: Budget[];
  searchText: string;
  isLoading: boolean;
  onSearchChange: (text: string) => void;
  onSelectBudget: (budget: Budget) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={searchText}
        onChange={e => onSearchChange(e.target.value)}
        placeholder={t('assemblyBudget.import.searchPlaceholder')}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
      />
      {isLoading ? (
        <div className="flex justify-center py-8">
          <SvgSpinner className="h-6 w-6 text-blue-600" />
        </div>
      ) : budgets.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">
          {t('assemblyBudget.import.noResults')}
        </p>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-y-auto max-h-72 divide-y divide-gray-100">
          {budgets.map(budget => (
            <button
              key={budget.id}
              type="button"
              onClick={() => onSelectBudget(budget)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors text-left"
            >
              <div>
                <span className="text-sm font-semibold text-gray-800">
                  {budget.code}
                </span>
                {budget.title && (
                  <span className="ml-2 text-sm text-gray-500">{budget.title}</span>
                )}
                <p className="text-xs text-gray-400">{budget.companyName}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Step2({
  sourceBudget,
  selectedNodeIds,
  targetFolders,
  targetParentNodeId,
  keepMargins,
  onNodeSelectionChange,
  onTargetParentChange,
  onKeepMarginsChange,
  t,
}: {
  sourceBudget: Budget;
  selectedNodeIds: string[];
  targetFolders: AssemblyFolder[];
  targetParentNodeId: string | undefined;
  keepMargins: boolean;
  onNodeSelectionChange: (ids: string[]) => void;
  onTargetParentChange: (id: string | undefined) => void;
  onKeepMarginsChange: (v: boolean) => void;
  t: (key: string) => string;
}) {
  const allNodeIds = collectAllNodeIds(sourceBudget.assemblyNodes ?? []);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('assemblyBudget.import.step2Title')}
          <span className="ml-2 text-xs font-normal text-gray-500">
            — {sourceBudget.code} {sourceBudget.companyName && `· ${sourceBudget.companyName}`}
          </span>
        </label>
        {sourceBudget.assemblyNodes && sourceBudget.assemblyNodes.length > 0 ? (
          <AssemblyNodeSelector
            nodes={sourceBudget.assemblyNodes}
            allNodeIds={allNodeIds}
            selectAllLabel={t('assemblyBudget.copy.selectAll')}
            selectNoneLabel={t('assemblyBudget.copy.selectNone')}
            countLabel={(s, total) => `${s} / ${total}`}
            onChange={onNodeSelectionChange}
          />
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            {t('assemblyBudget.nodeSelector.noNodes')}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <FolderOpen className="h-4 w-4 inline mr-1" />
          {t('assemblyBudget.import.targetFolderLabel')}
        </label>
        <select
          value={targetParentNodeId ?? ''}
          onChange={e => onTargetParentChange(e.target.value || undefined)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        >
          <option value="">{t('assemblyBudget.import.targetFolderPlaceholder')}</option>
          {targetFolders.map(folder => (
            <option key={folder.id} value={folder.id}>
              {folder.code} — {folder.description}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={keepMargins}
          onChange={e => onKeepMarginsChange(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">
          {t('assemblyBudget.import.keepMarginsLabel')}
        </span>
      </label>
    </div>
  );
}
