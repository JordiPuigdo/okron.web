'use client';

import { SvgMachines } from 'app/icons/icons';
import { UserType } from 'app/interfaces/User';
import { useSessionStore } from 'app/stores/globalStore';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import WorkOrderTable from './components/WorkOrderTable';

export default function WorkOrdersPage() {
  const { loginUser } = useSessionStore(state => state);
  const renderHeader = () => {
    const name =
      loginUser?.userType == UserType.Maintenance
        ? 'Ordres de treball'
        : 'Tiquets';
    return (
      <div className="flex p-2 my-2">
        <div className="w-full flex flex-col gap-2 items">
          <h2 className="text-2xl font-bold text-black flex gap-2">
            <SvgMachines />
            {name}
          </h2>
          <span className="text-l">Inici - Llistat de {name}</span>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <Container>
        <div className="flex flex-col h-full">
          {renderHeader()}
          <WorkOrderTable
            enableFilterAssets={true}
            enableFilters={true}
            enableEdit={true}
            enableDelete={true}
            enableFinalizeWorkOrdersDayBefore={
              loginUser?.userType == UserType.Maintenance ? true : false
            }
          />
        </div>
      </Container>
    </MainLayout>
  );
}
