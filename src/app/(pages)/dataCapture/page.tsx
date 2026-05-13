'use client';

import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import DataCaptureComponent from './components/DataCaptureComponent';

function DataCapturePage() {
  return (
    <MainLayout>
      <Container>
        <DataCaptureComponent />
      </Container>
    </MainLayout>
  );
}

export default DataCapturePage;
