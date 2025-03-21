'use client';
import { UserPermission } from 'app/interfaces/User';
import { useSessionStore } from 'app/stores/globalStore';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import SparePartTable from './components/SparePartTable';

function SparePartsPage() {
  const { loginUser } = useSessionStore(state => state);
  const validPermission = [
    UserPermission.Administrator,
    UserPermission.SpareParts,
  ];
  const canEdit = validPermission.includes(loginUser?.permission!);
  return (
    <MainLayout>
      <Container>
        <div className="flex flex-col h-full">
          <SparePartTable
            enableFilters={true}
            enableEdit={canEdit}
            enableDelete={canEdit}
          />
        </div>
      </Container>
    </MainLayout>
  );
}

export default SparePartsPage;
