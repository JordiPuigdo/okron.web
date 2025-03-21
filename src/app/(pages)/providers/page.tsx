import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import ProviderComponent from './ProviderComponent';

function ProviderPage() {
  return (
    <MainLayout>
      <Container>
        <ProviderComponent />
      </Container>
    </MainLayout>
  );
}

export default ProviderPage;
