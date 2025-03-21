'use client';
import { useDowntimeReport } from 'app/hooks/useDowntimeReport';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import DowntimeReport from './component/downtimeReport';

export default function Page() {
  const { downtimes, from, to, setFrom, setTo, fetchDowntimes, isLoading } =
    useDowntimeReport();

  return (
    <MainLayout>
      <Container>
        <DowntimeReport
          downtimesTicketReport={downtimes}
          from={from}
          to={to}
          setFrom={setFrom}
          setTo={setTo}
          reloadData={fetchDowntimes}
          isLoading={isLoading}
        />
      </Container>
    </MainLayout>
  );
}
