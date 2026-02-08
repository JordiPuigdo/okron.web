'use client';

import { useState } from 'react';
import { Article } from 'app/interfaces/Article';
import { Dialog, DialogContent } from 'components/Dialog';
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
    setEditingArticle(article);
    setIsModalOpen(true);
  };

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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          type="center"
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          modalVisibility={isModalOpen}
          setModalVisibility={setIsModalOpen}
        >
          <ArticleFormModal
            initialData={editingArticle}
            onSuccess={handleSuccess}
            onCancel={handleCloseModal}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
