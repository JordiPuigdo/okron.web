import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import PurchaseComponent from './components/PurchaseComponent';

export default function PurchasesPage() {
  return (
    <MainLayout>
      <Container>
        <PurchaseComponent />
      </Container>
    </MainLayout>
  );
}
