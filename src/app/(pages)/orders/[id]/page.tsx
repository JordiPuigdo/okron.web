import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import OrderDetail from './components/OrderDetail';

export default function OrderPage({
  params,
}: {
  params: { id: string; isPdf: boolean };
}) {
  return (
    <MainLayout>
      <Container>
        <OrderDetail id={params.id} isPdf={params.isPdf} />
      </Container>
    </MainLayout>
  );
}
