import Container from "components/layout/Container";
import MainLayout from "components/layout/MainLayout";
import SectionForm from "components/section/SectionForm";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <MainLayout>
      <Container>
        <SectionForm id={params.id} />
      </Container>
    </MainLayout>
  );
}
