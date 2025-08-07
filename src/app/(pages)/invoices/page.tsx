import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import InvoiceTabPage from './components/InvoiceTabPage';

export default function InvoicesPage() {
  return (
    <MainLayout>
      <Container>
        <InvoiceTabPage />
      </Container>
    </MainLayout>
  );
}
