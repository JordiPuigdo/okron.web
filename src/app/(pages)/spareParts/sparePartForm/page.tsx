import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import SparePartForm from './sparePartForm';

function SparePartsFormPage() {
  return (
    <MainLayout>
      <Container className="flex flex-col flex-1">
        <SparePartForm sparePartLoaded={undefined} />
      </Container>
    </MainLayout>
  );
}

export default SparePartsFormPage;
