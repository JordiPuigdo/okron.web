import Container from 'components/layout/Container';
import { HeaderForm } from 'components/layout/HeaderForm';
import MainLayout from 'components/layout/MainLayout';

import LowStockPurchase from './components/lowStockPurchase';

export default function Page() {
  return (
    <MainLayout>
      <Container className="flex flex-col">
        <HeaderForm
          header={'Proposta de comandes automàtica'}
          isCreate={false}
        />
        <LowStockPurchase />
      </Container>
    </MainLayout>
  );
}
