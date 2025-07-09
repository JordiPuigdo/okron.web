'use client';

import { useConfig } from 'app/hooks/useConfig';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import CorrectiveComponent from './components/GenerateCorrective';
import RepairReportPage from './components/repairReport/RepairReport';

function CorrectivePage() {
  const { config } = useConfig();
  return (
    <MainLayout>
      <Container>
        {config?.isCRM ? <RepairReportPage /> : <CorrectiveComponent />}
      </Container>
    </MainLayout>
  );
}

export default CorrectivePage;
