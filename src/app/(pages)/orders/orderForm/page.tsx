'use client';

import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';
import { useSearchParams } from 'next/navigation';

import OrderForm from './components/OrderForm';

interface OrderFormProps {
  params: { id: string; isPurchase: boolean };
}

export default function OrderFormPage({ params }: OrderFormProps) {
  const searchParams = useSearchParams();
  const isPurchase = searchParams.get('isPurchase') === 'true';
  return (
    <MainLayout>
      <Container>
        <OrderForm id={params.id} isPurchase={isPurchase} />
      </Container>
    </MainLayout>
  );
}
