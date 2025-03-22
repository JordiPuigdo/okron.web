'use client';

import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';
import { useSearchParams } from 'next/navigation';

import OrderForm from './components/OrderForm';

function OrderFormContent() {
  const searchParams = useSearchParams();
  const isPurchase = searchParams.get('isPurchase') === 'true';
  return <OrderForm isPurchase={isPurchase} />;
}

export default function OrderFormPage() {
  return (
    <MainLayout>
      <Container>
        <OrderFormContent />
      </Container>
    </MainLayout>
  );
}
