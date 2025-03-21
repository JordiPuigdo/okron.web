import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import DeliveryComponent from './components/DeliveryComponent';

function DeliverysPage() {
  return (
    <MainLayout>
      <Container>
        <DeliveryComponent />
      </Container>
    </MainLayout>
  );
}

export default DeliverysPage;
