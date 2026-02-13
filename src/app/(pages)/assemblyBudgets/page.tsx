'use client';

import { useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import Container from 'components/layout/Container';
import { HeaderTable } from 'components/layout/HeaderTable';
import MainLayout from 'components/layout/MainLayout';

import { AssemblyBudgetFormModal } from './components/AssemblyBudgetFormModal';
import { TableDataAssemblyBudgets } from './components/TableDataAssemblyBudgets';

export default function AssemblyBudgetsPage() {
  const { t } = useTranslations();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = () => {
    setIsFormOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <MainLayout>
      <Container>
        <div className="flex flex-col h-full">
          <HeaderTable
            title={t('assemblyBudgets')}
            subtitle={`${t('start')} - ${t('assemblyBudgets.list')}`}
            createButton={t('assemblyBudget.create')}
            onCreate={() => setIsFormOpen(true)}
          />
          <TableDataAssemblyBudgets
            className="bg-white p-4 rounded-xl shadow-md"
            refreshKey={refreshKey}
          />
        </div>
        <AssemblyBudgetFormModal
          isVisible={isFormOpen}
          onCancel={() => setIsFormOpen(false)}
          onSuccess={handleCreated}
        />
      </Container>
    </MainLayout>
  );
}
