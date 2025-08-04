'use client';

import Container from 'components/layout/Container';
import { HeaderTable } from 'components/layout/HeaderTable';
import MainLayout from 'components/layout/MainLayout';

import { TableDataDeliveryNotes } from './components/TableDataDeliveryNotes';

export default function DeliveryNotesPage() {
  return (
    <MainLayout>
      <Container>
        <div className="flex flex-col h-full">
          <HeaderTable
            title="Albarans"
            subtitle="Inici - Llistat d'Albarans"
            createButton="Crear Albarà"
            urlCreateButton="/deliveryNotes/create"
          />
          <TableDataDeliveryNotes className="bg-white p-4 rounded-xl shadow-md" />
        </div>
      </Container>
    </MainLayout>
  );
}