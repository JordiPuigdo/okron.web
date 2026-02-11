'use client';

import { useState } from 'react';
import {
  Article,
  ArticleType,
  CreateArticleComponentRequest,
} from 'app/interfaces/Article';
import AutocompleteSearchBar from 'components/selector/AutocompleteSearchBar';
import { ElementList } from 'components/selector/ElementList';
import { Layers, Plus, Trash2 } from 'lucide-react';

interface ComponentsTabProps {
  components: CreateArticleComponentRequest[];
  setComponents: (components: CreateArticleComponentRequest[]) => void;
  allArticles: Article[];
  currentArticleId?: string;
  t: (key: string) => string;
}

export function ComponentsTab({
  components,
  setComponents,
  allArticles,
  currentArticleId,
  t,
}: ComponentsTabProps) {
  const [selectedArticleId, setSelectedArticleId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');

  const billOfMaterialsArticles = allArticles.filter(
    a =>
      a.articleType === ArticleType.BillOfMaterials &&
      a.id !== currentArticleId
  );

  const availableArticles = billOfMaterialsArticles.filter(
    a => !components.some(c => c.articleId === a.id)
  );

  const articleElements: ElementList[] = availableArticles.map(a => ({
    id: a.id,
    description: `${a.code} - ${a.description}`,
  }));

  const selectedArticle = allArticles.find(a => a.id === selectedArticleId);

  const handleAdd = () => {
    const qty = parseFloat(quantity);
    if (!selectedArticleId || !qty || qty <= 0) return;

    const newComponent: CreateArticleComponentRequest = {
      articleId: selectedArticleId,
      quantity: qty,
      sortOrder: components.length,
    };

    setComponents([...components, newComponent]);
    setSelectedArticleId('');
    setQuantity('1');
  };

  const handleRemove = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) return;
    const updated = [...components];
    updated[index] = { ...updated[index], quantity: newQuantity };
    setComponents(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('components')} ({components.length})
        </h3>
      </div>

      {/* Search and add */}
      <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 shadow-sm space-y-4">
        <h4 className="font-semibold text-gray-900">
          {t('add.component')}
        </h4>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('article')}
            </label>
            <AutocompleteSearchBar
              elements={articleElements}
              setCurrentId={setSelectedArticleId}
              placeholder={t('search.bill.of.materials')}
            />
            {selectedArticle && (
              <div className="mt-2 text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                {t('selected')}:{' '}
                <span className="font-medium">
                  {selectedArticle.code} - {selectedArticle.description}
                </span>
              </div>
            )}
          </div>
          <div className="w-28">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('quantity')}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedArticleId}
            className="px-4 py-2.5 gap-2 flex items-center text-sm bg-okron-main hover:bg-okron-mainHover text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            {t('add')}
          </button>
        </div>
      </div>

      {/* List */}
      {components.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-2">🔧</div>
          <p className="font-medium">{t('no.components.added')}</p>
          <p className="text-sm mt-1">{t('add.components.to.create.bom')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {components.map((component, index) => {
            const article = allArticles.find(
              a => a.id === component.articleId
            );
            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Layers className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {article
                        ? `${article.code} - ${article.description}`
                        : component.articleId}
                    </div>
                    {article && (
                      <div className="text-sm text-gray-500">
                        {article.unitPrice.toFixed(2)}€ / {t('unit')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 font-medium">
                      {t('quantity')}:
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={component.quantity}
                      onChange={e =>
                        handleQuantityChange(
                          index,
                          Number(e.target.value) || 1
                        )
                      }
                      className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-center focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  {article && (
                    <span className="text-sm font-medium text-gray-700 w-24 text-right">
                      {(article.unitPrice * component.quantity).toFixed(2)}€
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
