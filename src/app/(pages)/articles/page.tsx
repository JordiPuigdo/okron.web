import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import ArticleComponent from './components/ArticleComponent';

function ArticlesPage() {
  return (
    <MainLayout>
      <Container>
        <ArticleComponent />
      </Container>
    </MainLayout>
  );
}

export default ArticlesPage;
