import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import PreventiveCalendar from './components/Calendar';

export default function PreventiveCalendarPage() {
  return (
    <MainLayout>
      <Container>
        <div className="flex flex-col h-full">
          <PreventiveCalendar />
        </div>
      </Container>
    </MainLayout>
  );
}
