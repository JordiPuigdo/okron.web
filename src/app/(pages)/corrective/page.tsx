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
        <div className="min-h-screen bg-gray-50 pb-8">
          {config?.isCRM ? <RepairReportPage /> : <CorrectiveComponent />}
        </div>
      </Container>
    </MainLayout>
  );
}

export default CorrectivePage;
