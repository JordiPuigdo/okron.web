import LoginChecker from 'components/layout/LoginChecker';
import MainLayout from 'components/layout/MainLayout';
import { Metadata } from 'next';

import AuthenticationPage from './(pages)/authentication/page';

const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL!;

export const metadata: Metadata = {
  metadataBase: new URL('https://okron.io'),
  title: 'Okron - Gmao & Warehouse',
  icons: {
    icon: [logoUrl],
  },
};
export default function Page() {
  return (
    <MainLayout hideHeader>
      <LoginChecker isLoginPage>
        <AuthenticationPage />
      </LoginChecker>
    </MainLayout>
  );
}
