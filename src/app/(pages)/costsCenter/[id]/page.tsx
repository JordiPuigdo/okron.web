'use client';

import { useEffect, useState } from 'react';
import { UpdateCostCenterRequest } from 'app/interfaces/CostCenter';
import { CostService } from 'app/services/costService';
import Container from 'components/layout/Container';
import { HeaderForm } from 'components/layout/HeaderForm';
import MainLayout from 'components/layout/MainLayout';
import BaseForm from 'components/OkronForm/BaseForm';
import { useRouter } from 'next/navigation';

export default function CostsCenterDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  const costCenterService = new CostService();
  const [costCenter, setCostCenter] = useState<UpdateCostCenterRequest>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {
    costCenterService.getById(id).then(data => {
      setCostCenter(data);
      setIsLoadingPage(false);
    });
  }, []);

  const router = useRouter();

  async function handleUpdate(data: UpdateCostCenterRequest): Promise<void> {
    setIsLoading(true);
    costCenterService
      .update(data)
      .then(data => {
        setIsUpdated(true);
        router.push(`/costsCenter`);
      })
      .catch(error => {
        console.error('Error updating cost center:', error);
        setIsLoading(false);
      });
  }

  return (
    <MainLayout>
      <Container>
        <HeaderForm
          isCreate={false}
          header={`${costCenter?.code} - ${costCenter?.description}`}
        />
        {!isLoadingPage && (
          <BaseForm<UpdateCostCenterRequest>
            title="Actualitza Compta Comptable"
            fields={[
              {
                name: 'code',
                label: 'Codi',
                placeholder: 'Introdueix el codi',
                rules: { required: 'El codi és obligatori' },
              },
              {
                name: 'description',
                label: 'Descripció',
                placeholder: 'Introdueix la descripció',
                rules: { required: 'La descripció és obligatòria' },
              },
              {
                name: 'active',
                label: 'Actiu',
                placeholder: 'Introdueix la descripció',
                type: 'checkbox',
                rules: { required: 'La descripció és obligatòria' },
              },
            ]}
            onSubmit={handleUpdate}
            onCancel={() => router.back()}
            defaultValues={costCenter}
            isSubmitting={isLoading}
            isSubmitted={isUpdated}
          />
        )}
      </Container>
    </MainLayout>
  );
}
