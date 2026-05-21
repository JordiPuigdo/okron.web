import LoginChecker from 'components/layout/LoginChecker';
import MainLayout from 'components/layout/MainLayout';

import AuthenticationPage from './(pages)/authentication/page';

export default function Page() {
  return (
    <MainLayout hideHeader>
      <LoginChecker isLoginPage>
        <AuthenticationPage />
      </LoginChecker>
    </MainLayout>
  );
}
