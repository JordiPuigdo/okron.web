import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import AccountComponent from './component/AccountComponent';

export default function AccountPage() {
  return (
    <MainLayout>
      <Container>
        <AccountComponent />
      </Container>
    </MainLayout>
  );
}
