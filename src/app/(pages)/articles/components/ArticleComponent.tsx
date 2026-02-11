'use client';

import { useState } from 'react';
import { Article, ArticleType } from 'app/interfaces/Article';
import { HeaderTable } from 'components/layout/HeaderTable';

import { useTranslations } from '../../../hooks/useTranslations';
import { ArticleFormModal } from './ArticleFormModal';
import { ArticleTable } from './ArticleTable';


export default function ArticleComponent() {
  const { t } = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | undefined>(
    undefined
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenModal = () => {
    setEditingArticle(undefined);
    setIsModalOpen(true);
  };

  const handleEditArticle = (article: Article) => {
    article.articleType = getArticleTypeLabel(article.articleType as any);
    setEditingArticle(article);
    setIsModalOpen(true);
  };

  const getArticleTypeLabel = (type: string): ArticleType => {
    return type === 'Component' ? ArticleType.Component : ArticleType.BillOfMaterials;
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingArticle(undefined);
  };

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseModal();
  };

  return (
    <div className="flex flex-col h-full">
      <HeaderTable
        title={t('articles')}
        subtitle={`${t('start')} - ${t('article.list')}`}
        createButton={t('create.article')}
        onCreate={handleOpenModal}
      />
      <ArticleTable key={refreshKey} onEdit={handleEditArticle} />

      <ArticleFormModal
        isVisible={isModalOpen}
        initialData={editingArticle}
        onSuccess={handleSuccess}
        onCancel={handleCloseModal}
      />
    </div>
  );
}
