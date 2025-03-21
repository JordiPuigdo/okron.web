import Container from "components/layout/Container";
import MainLayout from "components/layout/MainLayout";

import WorkOrderEditForm from "./components/workOrderEditForm";

export default function EditWorkOrder({ params }: { params: { id: string } }) {
  return (
    <MainLayout>
      <Container>
        <WorkOrderEditForm id={params.id} />
      </Container>
    </MainLayout>
  );
}
