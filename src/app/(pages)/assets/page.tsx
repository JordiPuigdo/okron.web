import Container from "components/layout/Container";
import MainLayout from "components/layout/MainLayout";

import AssetList from "./components/assetList";

export default function AssetsPage() {
  return (
    <MainLayout>
      <Container>
        <AssetList />
      </Container>
    </MainLayout>
  );
}
