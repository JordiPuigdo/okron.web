'use client';

import { CreateArticleComponentRequest } from 'app/interfaces/Article';

interface ComponentsTabProps {
  components: CreateArticleComponentRequest[];
  t: (key: string) => string;
}

export function ComponentsTab({
  components,
  t,
}: ComponentsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('components')} ({components.length})
        </h3>
        <p className="text-sm text-gray-600">{t('components.info.message')}</p>
      </div>

      {components.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-2">🔧</div>
          <p className="font-medium">{t('no.components.added')}</p>
          <p className="text-sm mt-1">{t('add.components.to.create.bom')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {components.map((component, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {component.articleId}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {t('quantity')}: {component.quantity}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
