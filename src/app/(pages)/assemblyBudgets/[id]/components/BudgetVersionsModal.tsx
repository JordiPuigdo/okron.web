'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useBudgetVersions } from 'app/hooks/useBudgetVersions';
import { SvgSpinner } from 'app/icons/icons';
import {
  Budget,
  BudgetVersionSummary,
  CreateBudgetVersionRequest,
  RestoreBudgetVersionRequest,
  UpdateBudgetVersionDescriptionRequest,
} from 'app/interfaces/Budget';
import dayjs from 'dayjs';
import { Button } from 'designSystem/Button/Buttons';
import { Modal2 } from 'designSystem/Modals/Modal';
import {
  AlertTriangle,
  Check,
  Clock,
  Eye,
  GitBranch,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';

interface BudgetVersionsModalProps {
  isVisible: boolean;
  budgetId: string;
  onClose: () => void;
  onVersionRestored: (budget: Budget) => void;
  onVersionPreview: (budget: Budget) => void;
  t: (key: string) => string;
}

export function BudgetVersionsModal({
  isVisible,
  budgetId,
  onClose,
  onVersionRestored,
  onVersionPreview,
  t,
}: BudgetVersionsModalProps) {
  const {
    versions,
    loading,
    error,
    fetchVersionsByBudgetId,
    fetchVersionById,
    createVersion,
    restoreVersion,
    updateDescription,
  } = useBudgetVersions();

  const [previewingVersionId, setPreviewingVersionId] = useState<string | undefined>(undefined);

  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isVisible) {
      fetchVersionsByBudgetId(budgetId);
      setShowCreateForm(false);
      setDescription('');
      setConfirmRestoreId(undefined);
      setSearchQuery('');
    }
  }, [isVisible, budgetId, fetchVersionsByBudgetId]);

  const handleCreateVersion = useCallback(async () => {
    setIsCreating(true);
    const request: CreateBudgetVersionRequest = {
      budgetId,
      description: description.trim() || undefined,
    };
    const result = await createVersion(request);
    if (result) {
      setDescription('');
      setShowCreateForm(false);
    }
    setIsCreating(false);
  }, [budgetId, description, createVersion]);

  const handleRestoreVersion = useCallback(
    async (versionId: string) => {
      const request: RestoreBudgetVersionRequest = {
        budgetId,
        versionId,
      };
      const restoredBudget = await restoreVersion(request);
      if (restoredBudget) {
        setConfirmRestoreId(undefined);
        onVersionRestored(restoredBudget);
        onClose();
      }
    },
    [budgetId, restoreVersion, onVersionRestored, onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !isCreating) {
        handleCreateVersion();
      }
    },
    [isCreating, handleCreateVersion]
  );

  const handleUpdateDescription = useCallback(
    async (versionId: string, newDescription: string) => {
      const request: UpdateBudgetVersionDescriptionRequest = {
        versionId,
        description: newDescription,
      };
      await updateDescription(request);
    },
    [updateDescription]
  );

  const handlePreviewVersion = useCallback(
    async (versionId: string) => {
      setPreviewingVersionId(versionId);
      const version = await fetchVersionById(versionId);
      if (version) {
        onVersionPreview(version.snapshot);
      }
      setPreviewingVersionId(undefined);
    },
    [fetchVersionById, onVersionPreview]
  );

  return (
    <Modal2
      isVisible={isVisible}
      setIsVisible={onClose}
      type="center"
      width="w-full max-w-lg"
      height="h-auto"
      className="overflow-hidden flex flex-col shadow-2xl"
      closeOnEsc
    >
      <div className="flex flex-col max-h-[80vh]">
        <ModalHeader onClose={onClose} t={t} />

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <CreateVersionSection
            showCreateForm={showCreateForm}
            description={description}
            isCreating={isCreating}
            onToggleForm={() => setShowCreateForm(!showCreateForm)}
            onDescriptionChange={setDescription}
            onKeyDown={handleKeyDown}
            onCreate={handleCreateVersion}
            t={t}
          />

          {error && <ErrorBanner message={error} />}

          <VersionList
            versions={versions}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            confirmRestoreId={confirmRestoreId}
            onRequestRestore={setConfirmRestoreId}
            onCancelRestore={() => setConfirmRestoreId(undefined)}
            onConfirmRestore={handleRestoreVersion}
            onUpdateDescription={handleUpdateDescription}
            onPreview={handlePreviewVersion}
            previewingVersionId={previewingVersionId}
            t={t}
          />
        </div>
      </div>
    </Modal2>
  );
}

function ModalHeader({
  onClose,
  t,
}: {
  onClose: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <div className="flex items-center gap-2.5">
        <div className="bg-blue-100 rounded-lg p-2">
          <GitBranch className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {t('assemblyBudget.versions.title')}
          </h2>
          <p className="text-xs text-gray-500">
            {t('assemblyBudget.versions.subtitle')}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function CreateVersionSection({
  showCreateForm,
  description,
  isCreating,
  onToggleForm,
  onDescriptionChange,
  onKeyDown,
  onCreate,
  t,
}: {
  showCreateForm: boolean;
  description: string;
  isCreating: boolean;
  onToggleForm: () => void;
  onDescriptionChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onCreate: () => void;
  t: (key: string) => string;
}) {
  if (!showCreateForm) {
    return (
      <button
        type="button"
        onClick={onToggleForm}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 border-dashed transition-colors"
      >
        <Plus className="h-4 w-4" />
        {t('assemblyBudget.versions.create')}
      </button>
    );
  }

  return (
    <div className="bg-blue-50/50 rounded-lg border border-blue-100 p-4 space-y-3">
      <label className="block text-xs font-medium text-gray-600">
        {t('assemblyBudget.versions.description')}
      </label>
      <input
        type="text"
        value={description}
        onChange={e => onDescriptionChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={t('assemblyBudget.versions.descriptionPlaceholder')}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <Button type="cancel" onClick={onToggleForm} customStyles="px-3 py-1.5 text-xs">
          {t('common.cancel')}
        </Button>
        <Button
          type="create"
          onClick={onCreate}
          customStyles="px-3 py-1.5 text-xs gap-1.5 flex items-center"
          disabled={isCreating}
        >
          <Plus className="h-3.5 w-3.5" />
          {t('assemblyBudget.versions.save')}
          {isCreating && <SvgSpinner className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

const SEARCH_VISIBLE_THRESHOLD = 5;

function VersionList({
  versions,
  loading,
  searchQuery,
  onSearchChange,
  confirmRestoreId,
  onRequestRestore,
  onCancelRestore,
  onConfirmRestore,
  onUpdateDescription,
  onPreview,
  previewingVersionId,
  t,
}: {
  versions: BudgetVersionSummary[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  confirmRestoreId?: string;
  onRequestRestore: (id: string) => void;
  onCancelRestore: () => void;
  onConfirmRestore: (id: string) => void;
  onUpdateDescription: (versionId: string, description: string) => Promise<void>;
  onPreview: (versionId: string) => void;
  previewingVersionId?: string;
  t: (key: string) => string;
}) {
  const sortedVersions = useMemo(
    () =>
      [...versions].sort(
        (a, b) =>
          new Date(b.versionDate).getTime() -
          new Date(a.versionDate).getTime()
      ),
    [versions]
  );

  const filteredVersions = useMemo(() => {
    if (!searchQuery.trim()) return sortedVersions;
    const query = searchQuery.toLowerCase();
    return sortedVersions.filter(
      v =>
        v.description?.toLowerCase().includes(query) ||
        `v${v.versionNumber}`.includes(query) ||
        dayjs(v.versionDate).format('DD/MM/YYYY HH:mm').includes(query)
    );
  }, [sortedVersions, searchQuery]);

  if (loading && versions.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <SvgSpinner className="w-6 h-6 text-blue-500" />
      </div>
    );
  }

  if (versions.length === 0) {
    return <EmptyState t={t} />;
  }

  const showSearch = versions.length >= SEARCH_VISIBLE_THRESHOLD;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {t('assemblyBudget.versions.history')}
        </h3>
        <span className="text-xs text-gray-400">
          {filteredVersions.length}/{versions.length}
        </span>
      </div>

      {showSearch && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={t('assemblyBudget.versions.searchPlaceholder')}
            className="w-full rounded-lg border border-gray-200 pl-8 pr-3 py-1.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-gray-50/50"
          />
        </div>
      )}

      <div className="space-y-1.5 max-h-[45vh] overflow-y-auto">
        {filteredVersions.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-4">
            {t('assemblyBudget.versions.noResults')}
          </p>
        ) : (
          filteredVersions.map(version => (
            <VersionItem
              key={version.id}
              version={version}
              isConfirming={confirmRestoreId === version.id}
              onRequestRestore={() => onRequestRestore(version.id)}
              onCancelRestore={onCancelRestore}
              onConfirmRestore={() => onConfirmRestore(version.id)}
              onUpdateDescription={onUpdateDescription}
              onPreview={() => onPreview(version.id)}
              isPreviewing={previewingVersionId === version.id}
              t={t}
            />
          ))
        )}
      </div>
    </div>
  );
}

function EmptyState({ t }: { t: (key: string) => string }) {
  return (
    <div className="text-center py-8 space-y-2">
      <GitBranch className="h-8 w-8 text-gray-300 mx-auto" />
      <p className="text-sm text-gray-500">
        {t('assemblyBudget.versions.empty')}
      </p>
      <p className="text-xs text-gray-400">
        {t('assemblyBudget.versions.emptyHint')}
      </p>
    </div>
  );
}

function VersionItem({
  version,
  isConfirming,
  onRequestRestore,
  onCancelRestore,
  onConfirmRestore,
  onUpdateDescription,
  onPreview,
  isPreviewing,
  t,
}: {
  version: BudgetVersionSummary;
  isConfirming: boolean;
  onRequestRestore: () => void;
  onCancelRestore: () => void;
  onConfirmRestore: () => void;
  onUpdateDescription: (versionId: string, description: string) => Promise<void>;
  onPreview: () => void;
  isPreviewing: boolean;
  t: (key: string) => string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(version.description ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const handleStartEdit = useCallback(() => {
    setEditValue(version.description ?? '');
    setIsEditing(true);
  }, [version.description]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditValue(version.description ?? '');
  }, [version.description]);

  const handleSaveEdit = useCallback(async () => {
    const trimmed = editValue.trim();
    if (trimmed === (version.description ?? '')) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    await onUpdateDescription(version.id, trimmed);
    setIsSaving(false);
    setIsEditing(false);
  }, [editValue, version.id, version.description, onUpdateDescription]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !isSaving) {
        handleSaveEdit();
      } else if (e.key === 'Escape') {
        handleCancelEdit();
      }
    },
    [isSaving, handleSaveEdit, handleCancelEdit]
  );

  return (
    <div
      className={`rounded-lg border p-3 transition-colors ${
        isConfirming
          ? 'border-amber-300 bg-amber-50'
          : 'border-gray-100 bg-white hover:border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">
              v{version.versionNumber}
            </span>
            {isEditing ? (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <input
                  type="text"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  className="flex-1 min-w-0 rounded border border-blue-300 px-2 py-0.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  autoFocus
                  disabled={isSaving}
                />
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
                >
                  {isSaving ? (
                    <SvgSpinner className="h-3.5 w-3.5" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 min-w-0 group">
                <span className="text-sm font-medium text-gray-800 truncate">
                  {version.description || t('assemblyBudget.versions.noDescription')}
                </span>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                  title={t('assemblyBudget.versions.editDescription')}
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1 ml-8">
            <Clock className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {dayjs(version.versionDate).format('DD/MM/YYYY HH:mm')}
            </span>
          </div>
        </div>

        {!isConfirming ? (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onPreview}
              disabled={isPreviewing}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              title={t('assemblyBudget.versions.preview')}
            >
              {isPreviewing ? (
                <SvgSpinner className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={onRequestRestore}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              title={t('assemblyBudget.versions.restore')}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t('assemblyBudget.versions.restore')}
            </button>
          </div>
        ) : (
          <ConfirmRestoreActions
            onCancel={onCancelRestore}
            onConfirm={onConfirmRestore}
            t={t}
          />
        )}
      </div>
    </div>
  );
}

function ConfirmRestoreActions({
  onCancel,
  onConfirm,
  t,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="text-xs text-amber-700 font-medium mr-1">
        {t('assemblyBudget.versions.confirmRestore')}
      </span>
      <button
        type="button"
        onClick={onCancel}
        className="px-2 py-1 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 rounded-md border border-gray-200 transition-colors"
      >
        {t('common.cancel')}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="px-2 py-1 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors"
      >
        {t('assemblyBudget.versions.confirm')}
      </button>
    </div>
  );
}
