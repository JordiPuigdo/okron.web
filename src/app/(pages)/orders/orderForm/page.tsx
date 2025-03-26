'use client';

import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';
import { useSearchParams } from 'next/navigation';

import OrderForm from './components/OrderForm';

function OrderFormContent() {
  const searchParams = useSearchParams();
  const isPurchase = searchParams.get('isPurchase') === 'true';
  const purchaseOrderId = searchParams.get('purchaseOrderId');
  return (
    <OrderForm
      isPurchase={isPurchase}
      purchaseOrderId={purchaseOrderId ? purchaseOrderId : undefined}
    />
  );
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
