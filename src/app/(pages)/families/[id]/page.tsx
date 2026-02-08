'use client';

import { useEffect, useState } from 'react';
import FamilyForm from 'app/(pages)/families/components/FamilyForm';
import { useFamilies } from 'app/hooks/useFamilies';
import { useTranslations } from 'app/hooks/useTranslations';
import { Family } from 'app/interfaces/Family';
import Container from 'components/layout/Container';
import { HeaderForm } from 'components/layout/HeaderForm';
import MainLayout from 'components/layout/MainLayout';
import { EntityTable } from 'components/table/interface/tableEntitys';
import { useRouter } from 'next/navigation';

export default function FamilyPage({ params }: { params: { id: string } }) {
  const { t } = useTranslations();
  const { getById } = useFamilies();
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const id = params.id;
  const isNew = params.id === 'new';

  useEffect(() => {
    const load = async () => {
      if (!isNew) {
        const response = await getById(id);
        if (response) setFamily(response);
      }
    };
    load();
  }, []);

  const handleSuccess = () => {
    if (isNew) router.push('/families');
  };

  const subTitle = !isNew ? `${family?.name} - ${family?.codePrefix}` : '';

  return (
    <MainLayout>
      <Container>
        <div className="flex flex-col h-full pb-4">
          <HeaderForm
            isCreate={isNew}
            header={isNew ? t('family.create') : t('family.edit')}
            subtitle={subTitle}
            entity={isNew ? undefined : EntityTable.FAMILY}
          />
          <FamilyForm
            initialData={family || undefined}
            onSuccess={handleSuccess}
          />
        </div>
      </Container>
    </MainLayout>
  );
}
