import MainLayout from "components/layout/MainLayout";

import SparePartForm from "./sparePartForm";

function SparePartsFormPage() {
  return (
    <MainLayout>
      <SparePartForm sparePartLoaded={undefined} />
    </MainLayout>
  );
}

export default SparePartsFormPage;
