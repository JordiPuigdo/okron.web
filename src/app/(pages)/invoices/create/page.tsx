'use client';

import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import { InvoiceCreateForm } from '../components/InvoiceCreateForm';

export default function InvoiceCreatePage() {
  return (
    <MainLayout>
      <Container>
        <InvoiceCreateForm />
      </Container>
    </MainLayout>
  );
}