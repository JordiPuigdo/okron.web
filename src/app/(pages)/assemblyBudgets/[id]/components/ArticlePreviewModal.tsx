'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { ArticleType, ArticleWithFullTree } from 'app/interfaces/Article';
import { ArticleService } from 'app/services/articleService';
import { formatCurrencyServerSider } from 'app/utils/utils';
import { Package, Wrench, X } from 'lucide-react';

interface ArticlePreviewModalProps {
  articleId: string | null;
  onClose: () => void;
}

function ArticleTypeBadge({ articleType }: { articleType: ArticleType }) {
  const { t } = useTranslations();
  const isComponent = articleType === ArticleType.Component;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isComponent
          ? 'bg-blue-100 text-blue-700'
          : 'bg-amber-100 text-amber-700'
      }`}
    >
      {isComponent ? (
        <Wrench className="h-3 w-3" />
      ) : (
        <Package className="h-3 w-3" />
      )}
      {isComponent ? t('article.type.component') : t('article.type.bom')}
    </span>
  );
}

export function ArticlePreviewModal({
  articleId,
  onClose,
}: ArticlePreviewModalProps) {
  const { t } = useTranslations();
  const [article, setArticle] = useState<ArticleWithFullTree | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!articleId) {
      setArticle(null);
      return;
    }
    setIsLoading(true);
    setError(false);
    const service = new ArticleService();
    service
      .getByIdWithFullTree(articleId)
      .then(setArticle)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [articleId]);

  if (!articleId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-500 shrink-0" />
            <h3 className="text-sm font-semibold text-gray-900">
              {t('article.preview')}
            </h3>
            {article && (
              <span className="text-xs text-gray-400 font-mono">
                {article.code}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-10 text-sm text-gray-400">
              {t('loading')}
            </div>
          )}

          {error && !isLoading && (
            <div className="flex items-center justify-center py-10 text-sm text-red-500">
              {t('error.loading')}
            </div>
          )}

          {article && !isLoading && (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-gray-900 leading-snug">
                    {article.description}
                  </p>
                  {article.familyPath && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {article.familyPath}
                    </p>
                  )}
                </div>
                <ArticleTypeBadge articleType={article.articleType} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                    {t('price')}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 tabular-nums">
                    {formatCurrencyServerSider(article.unitPrice)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                    {t('assemblyBudget.column.margin')}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 tabular-nums">
                    {article.marginPercentage}%
                  </p>
                </div>
              </div>

              {article.notes && (
                <div>
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                    {t('notes')}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {article.notes}
                  </p>
                </div>
              )}

              {article.providers && article.providers.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">
                    {t('article.providers')}
                  </p>
                  <div className="rounded-lg border border-gray-100 overflow-hidden">
                    {article.providers.map((provider, index) => (
                      <div
                        key={provider.id}
                        className={`flex items-center justify-between px-3 py-2 text-sm ${
                          index > 0 ? 'border-t border-gray-100' : ''
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="font-medium text-gray-800">
                            {provider.providerName}
                          </span>
                          {provider.providerReference && (
                            <span className="text-gray-400 ml-1.5 text-xs font-mono">
                              {provider.providerReference}
                            </span>
                          )}
                          {provider.isDefault && (
                            <span className="ml-2 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                              {t('article.provider.default')}
                            </span>
                          )}
                        </div>
                        <span className="text-gray-700 font-medium tabular-nums shrink-0 ml-3">
                          {formatCurrencyServerSider(provider.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {article.expandedComponents &&
                article.expandedComponents.length > 0 && (
                  <div>
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">
                      {t('article.components')}
                    </p>
                    <div className="rounded-lg border border-gray-100 overflow-hidden">
                      {article.expandedComponents.map((component, index) => (
                        <div
                          key={component.id}
                          className={`flex items-center justify-between px-3 py-2 text-sm ${
                            index > 0 ? 'border-t border-gray-100' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <ArticleTypeBadge
                              articleType={component.articleType}
                            />
                            <span className="font-mono text-xs text-gray-400 shrink-0">
                              {component.code}
                            </span>
                            <span className="text-gray-700 truncate">
                              {component.description}
                            </span>
                          </div>
                          <span className="text-gray-500 text-xs tabular-nums shrink-0 ml-3">
                            {formatCurrencyServerSider(component.unitPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        <div className="flex justify-end px-6 py-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
