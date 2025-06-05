import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import CostCenterComponent from './component/CostCenterComponent';

export default function CostsCenterPage() {
  return (
    <MainLayout>
      <Container>
        <CostCenterComponent />
      </Container>
    </MainLayout>
  );
}
