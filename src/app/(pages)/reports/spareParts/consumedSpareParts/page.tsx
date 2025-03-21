import Container from "components/layout/Container";
import MainLayout from "components/layout/MainLayout";

import ConsumedSparePartsComponent from "./consumedSparePartsComponent";

export default function consumedSparePartReport() {
  return (
    <MainLayout>
      <Container>
        <ConsumedSparePartsComponent />
      </Container>
    </MainLayout>
  );
}
