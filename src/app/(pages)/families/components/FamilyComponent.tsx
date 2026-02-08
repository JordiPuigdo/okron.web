'use client';

import { useState } from 'react';
import { HeaderTable } from 'components/layout/HeaderTable';
import { Dialog, DialogContent } from 'components/Dialog';
import { Family } from 'app/interfaces/Family';

import { useTranslations } from '../../../hooks/useTranslations';
import { FamilyTable } from './FamilyTable';
import { FamilyFormModal } from './FamilyFormModal';

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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          type="center"
          className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          modalVisibility={isModalOpen}
          setModalVisibility={setIsModalOpen}
        >
          <FamilyFormModal 
            initialData={editingFamily}
            onSuccess={handleSuccess} 
            onCancel={handleCloseModal} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
