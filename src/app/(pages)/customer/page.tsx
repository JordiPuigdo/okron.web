import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import CustomerComponent from './components/CustomerComponent';

function CustomerPage() {
  return (
    <MainLayout>
      <Container>
        <CustomerComponent />
      </Container>
    </MainLayout>
  );
}

export default CustomerPage;
