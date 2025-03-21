import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import WareHouseComponent from './WareHouseComponent';

function WareHousePage() {
  return (
    <MainLayout>
      <Container>
        <WareHouseComponent />
      </Container>
    </MainLayout>
  );
}

export default WareHousePage;
