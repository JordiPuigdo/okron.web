import Container from 'components/layout/Container';
import LoginChecker from 'components/layout/LoginChecker';
import MainLayout from 'components/layout/MainLayout';

import { HeaderMenu } from './dashboard/components/HeaderMenu';
import DashboardPage from './dashboard/page';

export default function MenuPage() {
  return (
    <MainLayout>
      <Container>
        <LoginChecker>
          <div className="flex flex-col w-full">
            <HeaderMenu />
            <div>
              <DashboardPage />
            </div>
          </div>
        </LoginChecker>
      </Container>
    </MainLayout>
  );
}
