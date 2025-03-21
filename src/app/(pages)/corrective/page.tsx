import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import CorrectiveComponent from './components/GenerateCorrective';

function CorrectivePage() {
  return (
    <MainLayout>
      <Container>
        <CorrectiveComponent></CorrectiveComponent>
      </Container>
    </MainLayout>
  );
}

export default CorrectivePage;
