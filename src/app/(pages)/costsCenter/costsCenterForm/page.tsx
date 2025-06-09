'use client';
import { useEffect, useState } from 'react';
import { CostCenter, CreateCostCenterRequest } from 'app/interfaces/CostCenter';
import { CostService } from 'app/services/costService';
import Container from 'components/layout/Container';
import { HeaderForm } from 'components/layout/HeaderForm';
import MainLayout from 'components/layout/MainLayout';
import BaseForm from 'components/OkronForm/BaseForm';
import { useRouter } from 'next/navigation';

export default function CostsCenterFormPage() {
  const router = useRouter();
  const costCenterService = new CostService();
  const [costCenter, setCostCenter] = useState<CostCenter[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    costCenterService.getAll().then(data => {
      setCostCenter(data);
    });
  }, []);

  async function handleCreate(data: CreateCostCenterRequest): Promise<void> {
    if (
      costCenter.find(
        x => x.code.toLocaleUpperCase() == data.code.toLocaleUpperCase()
      )
    ) {
      setErrorMessage('El codi ja existeix');
      setTimeout(() => {
        setErrorMessage(undefined);
      }, 2000);
      return;
    }
    costCenterService.create(data).then(data => {
      router.push(`/costsCenter`);
    });
  }

  return (
    <MainLayout>
      <Container>
        <HeaderForm header="Crear Centre Costs" isCreate />
        <BaseForm<CreateCostCenterRequest>
          title="Nou Compta Comptable"
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
          ]}
          onSubmit={handleCreate}
          onCancel={() => router.back()}
          errorMessage={errorMessage}
        />
      </Container>
    </MainLayout>
  );
}
