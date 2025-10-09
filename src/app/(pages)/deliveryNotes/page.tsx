'use client';

import { useTranslations } from 'app/hooks/useTranslations';
import Container from 'components/layout/Container';
import { HeaderTable } from 'components/layout/HeaderTable';
import MainLayout from 'components/layout/MainLayout';

import { TableDataDeliveryNotes } from './components/TableDataDeliveryNotes';

export default function DeliveryNotesPage() {
  const { t } = useTranslations();
  
  return (
    <MainLayout>
      <Container>
        <div className="flex flex-col h-full">
          <HeaderTable
            title={t('delivery.notes')}
            subtitle={`${t('start')} - ${t('delivery.notes.list')}`}
            createButton={t('create.delivery.note')}
            urlCreateButton="/deliveryNotes/create"
          />
          <TableDataDeliveryNotes className="bg-white p-4 rounded-xl shadow-md" />
        </div>
      </Container>
    </MainLayout>
  );
}