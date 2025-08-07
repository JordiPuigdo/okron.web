'use client';

import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import { DeliveryNoteCreateForm } from '../components/DeliveryNoteCreateForm';

export default function DeliveryNoteCreatePage() {
  return (
    <MainLayout>
      <Container>
        <DeliveryNoteCreateForm />
      </Container>
    </MainLayout>
  );
}