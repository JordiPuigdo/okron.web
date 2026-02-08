import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import FamilyComponent from './components/FamilyComponent';

function FamiliesPage() {
  return (
    <MainLayout>
      <Container>
        <FamilyComponent />
      </Container>
    </MainLayout>
  );
}

export default FamiliesPage;
