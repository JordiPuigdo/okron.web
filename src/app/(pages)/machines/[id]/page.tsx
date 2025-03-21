'use client';

import { useEffect, useState } from 'react';
import { SvgMachines } from 'app/icons/icons';
import MachineService from 'app/services/machineService';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';
import { useRouter } from 'next/navigation';

import MachineForm from '../../../../components/MachineForm';
import Machine from '../../../interfaces/machine';
import Downtimes from '../downtimes/downtime';

export default function EditMachinePage({
  params,
}: {
  params: { id: string };
}) {
  const fetchMachineData = async () => {
    try {
      const machineService = new MachineService(
        process.env.NEXT_PUBLIC_API_BASE_URL || ''
      );
      const machineData = await machineService.getMachineById(
        params.id as string
      );
      return machineData;
    } catch (error) {
      console.error('Error fetching machine data:', error);
      return null;
    }
  };
  const router = useRouter();

  const [machineData, setMachineData] = useState<Machine | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchMachineData().then(data => {
        if (data) {
          setMachineData(data);
        }
      });
    }
  }, [params.id]);

  function onCancel() {
    history.back();
  }

  const renderHeader = () => {
    return (
      <div className="flex p-2 my-2">
        <div className="w-full flex flex-col gap-2 items">
          <h2 className="text-2xl font-bold text-black flex gap-2">
            <SvgMachines />
            {machineData?.code} - {machineData?.description}
          </h2>
        </div>
      </div>
    );
  };
  return (
    <MainLayout>
      <Container>
        {renderHeader()}
        {machineData && (
          <div className="w-full flex flex-row gap-8">
            <MachineForm
              machine={machineData}
              onCancel={onCancel}
              onSubmit={function (data: Machine): void {
                throw new Error('Function not implemented.');
              }}
            />
            <Downtimes machineId={machineData.id} />
          </div>
        )}
      </Container>
    </MainLayout>
  );
}
