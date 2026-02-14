'use client';

import { useState } from 'react';
import { Family } from 'app/interfaces/Family';
import { HeaderTable } from 'components/layout/HeaderTable';

import { useTranslations } from '../../../hooks/useTranslations';
import { FamilyFormModal } from './FamilyFormModal';
import { FamilyTable } from './FamilyTable';

export default function FamilyComponent() {
  const { t } = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenModal = () => {
    setEditingFamily(undefined);
    setIsModalOpen(true);
  };

  const handleEditFamily = (family: Family) => {
    setEditingFamily(family);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFamily(undefined);
  };

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseModal();
  };

  return (
    <div className="flex flex-col h-full">
      <HeaderTable
        title={t('families')}
        subtitle={`${t('start')} - ${t('family.list')}`}
        createButton={t('create.family')}
        onCreate={handleOpenModal}
      />
      <FamilyTable key={refreshKey} onEdit={handleEditFamily} />

      <FamilyFormModal
        isVisible={isModalOpen}
        initialData={editingFamily}
        onSuccess={handleSuccess}
        onCancel={handleCloseModal}
      />
    </div>
  );
}
