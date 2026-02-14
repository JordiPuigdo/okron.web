'use client';

import { useEffect, useMemo, useState } from 'react';
import { SvgSpinner } from 'app/icons/icons';
import { Article, ArticleType } from 'app/interfaces/Article';
import {
  AssemblyFolder,
  AssemblyNode,
  BudgetNodeType,
} from 'app/interfaces/Budget';
import { formatCurrencyServerSider } from 'app/utils/utils';
import AutocompleteSearchBar from 'components/selector/AutocompleteSearchBar';
import { Button } from 'designSystem/Button/Buttons';
import { Modal2 } from 'designSystem/Modals/Modal';
import {
  ChevronDown,
  Folder,
  Layers,
  Package,
  Pencil,
  Plus,
  Wrench,
  X,
} from 'lucide-react';

interface FolderOption {
  id: string;
  code: string;
  description: string;
  depth: number;
}

function collectFolders(
  nodes: AssemblyNode[],
  depth = 0
): FolderOption[] {
  const result: FolderOption[] = [];
  for (const node of nodes) {
    if (node.nodeType === BudgetNodeType.Folder) {
      const folder = node as AssemblyFolder;
      result.push({
        id: folder.id,
        code: folder.code,
        description: folder.description,
        depth,
      });
      result.push(...collectFolders(folder.children, depth + 1));
    }
  }
  return result;
}

interface AddArticleModalProps {
  isVisible: boolean;
  articles: Article[];
  nodes: AssemblyNode[];
  selectedParentNodeId: string | undefined;
  onParentChange: (parentNodeId: string | undefined) => void;
  onClose: () => void;
  onConfirm: (
    article: Article,
    quantity: number,
    marginPercentage: number
  ) => Promise<void>;
  onCreateNew: () => void;
  onEditArticle: (article: Article) => void;
  initialArticle?: Article;
  t: (key: string) => string;
}

export function AddArticleModal({
  isVisible,
  articles,
  nodes,
  selectedParentNodeId,
  onParentChange,
  onClose,
  onConfirm,
  onCreateNew,
  onEditArticle,
  initialArticle,
  t,
}: AddArticleModalProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [marginPercentage, setMarginPercentage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const folderOptions = useMemo(() => collectFolders(nodes), [nodes]);

  useEffect(() => {
    if (isVisible) {
      if (initialArticle) {
        setSelectedArticle(initialArticle);
        setMarginPercentage(initialArticle.marginPercentage || 0);
      } else {
        setSelectedArticle(undefined);
        setMarginPercentage(0);
      }
      setQuantity(1);
    }
  }, [isVisible, initialArticle]);

  const handleSelectArticle = (id: string) => {
    const article = articles.find(a => a.id === id);
    if (article) {
      setSelectedArticle(article);
      setMarginPercentage(article.marginPercentage || 0);
    }
  };

  const handleConfirm = async () => {
    if (!selectedArticle || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm(selectedArticle, quantity, marginPercentage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const articleTypeLabel = (type: ArticleType) =>
    type === ArticleType.Component ? t('component') : t('bill.of.materials');

  const articleElements = articles.map(a => ({
    id: a.id,
    description: `${a.description} · ${articleTypeLabel(a.articleType)}`,
    code: a.code,
  }));

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
      <div className="flex flex-col">
        <ModalHeader t={t} />

        <div className="p-6 space-y-4">
          {folderOptions.length > 0 && (
            <ParentFolderSelector
              folders={folderOptions}
              selectedId={selectedParentNodeId}
              onChange={onParentChange}
              t={t}
            />
          )}

          <ArticleSearch
            articleElements={articleElements}
            onSelect={handleSelectArticle}
            t={t}
          />

          {selectedArticle && (
            <SelectedArticlePreview
              article={selectedArticle}
              onClear={() => setSelectedArticle(undefined)}
              onEdit={() => onEditArticle(selectedArticle)}
              t={t}
            />
          )}

          {selectedArticle && (
            <QuantityAndMarginFields
              quantity={quantity}
              marginPercentage={marginPercentage}
              onQuantityChange={setQuantity}
              onMarginChange={setMarginPercentage}
              t={t}
            />
          )}

          <CreateNewArticleButton
            onClick={onCreateNew}
            disabled={!!selectedArticle}
            t={t}
          />
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button type="cancel" onClick={onClose} customStyles="px-4 py-2">
            {t('common.cancel')}
          </Button>
          <Button
            type="create"
            onClick={handleConfirm}
            customStyles="px-4 py-2 gap-2 flex items-center"
            disabled={!selectedArticle || isSubmitting}
          >
            <Plus className="h-4 w-4" />
            {t('add')}
            {isSubmitting && <SvgSpinner className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </Modal2>
  );
}

function ModalHeader({ t }: { t: (key: string) => string }) {
  return (
    <div className="px-6 py-4 border-b bg-blue-50">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 text-white rounded-lg w-9 h-9 flex items-center justify-center">
          <Wrench className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          {t('assemblyBudget.addArticle')}
        </h2>
      </div>
    </div>
  );
}

function ArticleSearch({
  articleElements,
  onSelect,
  t,
}: {
  articleElements: { id: string; description: string; code: string }[];
  onSelect: (id: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {t('article')} *
      </label>
      <AutocompleteSearchBar
        elements={articleElements}
        setCurrentId={onSelect}
        placeholder={t('assemblyBudget.article.search.placeholder')}
        className="rounded-lg border-2 border-gray-200 focus-within:border-blue-500 transition-colors"
      />
    </div>
  );
}

function SelectedArticlePreview({
  article,
  onClear,
  onEdit,
  t,
}: {
  article: Article;
  onClear: () => void;
  onEdit: () => void;
  t: (key: string) => string;
}) {
  const isComponent = article.articleType === ArticleType.Component;
  const hasComponents = article.components && article.components.length > 0;

  return (
    <div className="rounded-lg border border-blue-100 overflow-hidden">
      <div className="bg-blue-50 p-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="relative group bg-blue-600 text-white rounded-full w-9 h-9 flex items-center justify-center shrink-0 hover:bg-blue-700 transition-colors cursor-pointer"
            title={t('edit.article')}
          >
            <Wrench className="h-4 w-4 group-hover:opacity-0 transition-opacity" />
            <Pencil className="h-4 w-4 absolute opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900 truncate">
                {article.description}
              </p>
              <ArticleTypeBadge type={article.articleType} t={t} />
            </div>
            <p className="text-xs text-gray-500">
              {article.code} ·{' '}
              {formatCurrencyServerSider(article.unitPrice)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="p-1 rounded hover:bg-blue-100 text-gray-400 hover:text-gray-600 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isComponent && hasComponents && (
        <ComponentsList components={article.components} t={t} />
      )}
    </div>
  );
}

function ArticleTypeBadge({
  type,
  t,
}: {
  type: ArticleType;
  t: (key: string) => string;
}) {
  const isComponent = type === ArticleType.Component;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${
        isComponent
          ? 'bg-blue-100 text-blue-700'
          : 'bg-purple-100 text-purple-700'
      }`}
    >
      {isComponent ? (
        <Package className="h-3 w-3" />
      ) : (
        <Layers className="h-3 w-3" />
      )}
      {isComponent ? t('component') : t('bill.of.materials')}
    </span>
  );
}

function ComponentsList({
  components,
  t,
}: {
  components: Article['components'];
  t: (key: string) => string;
}) {
  return (
    <div className="border-t border-blue-100 bg-white px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-2">
        <Layers className="h-3.5 w-3.5 text-purple-500" />
        <span className="text-xs font-semibold text-gray-600">
          {t('assemblyBudget.article.escandallo')} ({components.length})
        </span>
      </div>
      <div className="space-y-1 max-h-[140px] overflow-y-auto">
        {components.map(comp => (
          <div
            key={comp.articleId}
            className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-gray-50 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <ArticleTypeBadge type={comp.articleType} t={t} />
              <span className="text-gray-700 truncate">
                {comp.articleCode} — {comp.articleDescription}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-gray-400 tabular-nums">
                {comp.quantity} x{' '}
                {formatCurrencyServerSider(comp.unitPrice)}
              </span>
              <span className="font-medium text-gray-700 tabular-nums">
                {formatCurrencyServerSider(comp.subtotal)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuantityAndMarginFields({
  quantity,
  marginPercentage,
  onQuantityChange,
  onMarginChange,
  t,
}: {
  quantity: number;
  marginPercentage: number;
  onQuantityChange: (value: number) => void;
  onMarginChange: (value: number) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('quantity')} *
        </label>
        <input
          type="number"
          min={1}
          step={1}
          value={quantity}
          onChange={e => onQuantityChange(Math.max(1, Number(e.target.value)))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('margin.percentage')}
        </label>
        <div className="relative">
          <input
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={marginPercentage}
            onChange={e => onMarginChange(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-8 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            %
          </span>
        </div>
      </div>
    </div>
  );
}

function CreateNewArticleButton({
  onClick,
  disabled,
  t,
}: {
  onClick: () => void;
  disabled: boolean;
  t: (key: string) => string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-dashed border-blue-300 transition-colors justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
    >
      <Plus className="h-4 w-4" />
      {t('create.article')}
    </button>
  );
}

function ParentFolderSelector({
  folders,
  selectedId,
  onChange,
  t,
}: {
  folders: FolderOption[];
  selectedId: string | undefined;
  onChange: (id: string | undefined) => void;
  t: (key: string) => string;
}) {
  const selectedFolder = folders.find(f => f.id === selectedId);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {t('assemblyBudget.targetFolder')}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500">
          <Folder className="h-4 w-4" />
        </div>
        <select
          value={selectedId || ''}
          onChange={e => onChange(e.target.value || undefined)}
          className="w-full appearance-none rounded-lg border-2 border-gray-200 bg-white pl-9 pr-9 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors cursor-pointer"
        >
          <option value="">{t('assemblyBudget.rootLevel')}</option>
          {folders.map(folder => (
            <option key={folder.id} value={folder.id}>
              {'  '.repeat(folder.depth)}
              {folder.code} — {folder.description}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {selectedFolder && (
        <p className="mt-1 text-xs text-gray-500">
          {selectedFolder.code} — {selectedFolder.description}
        </p>
      )}
    </div>
  );
}
