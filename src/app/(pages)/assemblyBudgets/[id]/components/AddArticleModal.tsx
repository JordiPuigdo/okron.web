'use client';

import { useEffect, useState } from 'react';
import { SvgSpinner } from 'app/icons/icons';
import { Article } from 'app/interfaces/Article';
import { formatCurrencyServerSider } from 'app/utils/utils';
import AutocompleteSearchBar from 'components/selector/AutocompleteSearchBar';
import { Button } from 'designSystem/Button/Buttons';
import { Modal2 } from 'designSystem/Modals/Modal';
import { Plus, Wrench, X } from 'lucide-react';

interface AddArticleModalProps {
  isVisible: boolean;
  articles: Article[];
  onClose: () => void;
  onConfirm: (
    article: Article,
    quantity: number,
    marginPercentage: number
  ) => Promise<void>;
  onCreateNew: () => void;
  t: (key: string) => string;
}

export function AddArticleModal({
  isVisible,
  articles,
  onClose,
  onConfirm,
  onCreateNew,
  t,
}: AddArticleModalProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [marginPercentage, setMarginPercentage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setSelectedArticle(undefined);
      setQuantity(1);
      setMarginPercentage(0);
    }
  }, [isVisible]);

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

  const articleElements = articles.map(a => ({
    id: a.id,
    description: a.description,
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
          <ArticleSearch
            articleElements={articleElements}
            onSelect={handleSelectArticle}
            t={t}
          />

          {selectedArticle && (
            <SelectedArticlePreview
              article={selectedArticle}
              onClear={() => setSelectedArticle(undefined)}
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

          <CreateNewArticleButton onClick={onCreateNew} t={t} />
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
}: {
  article: Article;
  onClear: () => void;
}) {
  return (
    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 text-white rounded-full w-9 h-9 flex items-center justify-center">
          <Wrench className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {article.description}
          </p>
          <p className="text-xs text-gray-500">
            {article.code} ·{' '}
            {formatCurrencyServerSider(article.unitPrice)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="p-1 rounded hover:bg-blue-100 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
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
          {t('assemblyBudget.field.defaultMargin')}
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
  t,
}: {
  onClick: () => void;
  t: (key: string) => string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-dashed border-blue-300 transition-colors justify-center"
    >
      <Plus className="h-4 w-4" />
      {t('assemblyBudget.article.createNew')}
    </button>
  );
}
