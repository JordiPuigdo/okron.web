'use client';
import { useEffect, useState } from 'react';
import { SvgCreate, SvgMachines, SvgSpinner } from 'app/icons/icons';
import { Preventive } from 'app/interfaces/Preventive';
import PreventiveService from 'app/services/preventiveService';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';
import { Button } from 'designSystem/Button/Buttons';
import { useRouter } from 'next/navigation';

import GeneratePreventive from './components/GeneratePreventive';
import PreventiveTable from './preventiveTable/preventiveTable';

function PreventivePage() {
  const preventiveService = new PreventiveService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );

  const [preventives, setPreventives] = useState<Preventive[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPreventives = async () => {
      try {
        const fetchedPreventives = await preventiveService.getPreventives();
        setPreventives(fetchedPreventives);
      } catch (error) {
        setIsLoadingPage(false);
        console.error('Error fetching preventives:', error);
      }
      setIsLoadingPage(false);
    };

    fetchPreventives();
  }, []);

  const renderHeader = () => {
    return (
      <div className="flex p-2 my-2">
        <div className="w-full flex flex-col gap-2  justify-between">
          <h2 className="text-2xl font-bold text-black flex gap-2 flex-grow">
            <SvgMachines />
            Revisions
          </h2>
          <span className="text-l self-start">
            Inici - Llistat de Revisions
          </span>
        </div>
        <div className="w-full flex flex-col justify-end items-end gap-2 ">
          <Button
            type="create"
            href={`/preventive/preventiveForm`}
            onClick={() => setIsLoading(true)}
            customStyles="flex items-center gap-2"
          >
            <SvgCreate />
            Crear Revisió
            {isLoading && <SvgSpinner className="w-6 h-6" />}
          </Button>
          <GeneratePreventive />
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <Container>
        <div className="flex flex-col h-full">
          {renderHeader()}
          {isLoadingPage && <SvgSpinner className="flex w-full" />}
          {!isLoadingPage && (
            <PreventiveTable
              enableFilters={true}
              enableDelete={true}
              enableEdit={true}
            />
          )}
        </div>
      </Container>
    </MainLayout>
  );
}

export default PreventivePage;
