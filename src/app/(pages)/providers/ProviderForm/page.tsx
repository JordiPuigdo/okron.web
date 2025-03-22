'use client';

import { useProviders } from 'app/hooks/useProviders';
import { ProviderRequest } from 'app/interfaces/Provider';
import Container from 'components/layout/Container';
import { HeaderForm } from 'components/layout/HeaderForm';
import MainLayout from 'components/layout/MainLayout';
import { useRouter } from 'next/navigation';

import ProviderForm from './ProviderForm';

export default function page() {
  const { createProvider } = useProviders();
  const router = useRouter();

  const onSubmit = async (data: ProviderRequest) => {
    try {
      const provider = await createProvider(data);
      router.push(`/providers/${provider.id}`);
    } catch (error) {
      console.error('Error creating provider:', error);
    }
  };

  return (
    <MainLayout>
      <Container className="flex flex-col flex-1">
        <HeaderForm header="Crear Proveïdor" isCreate />
        <ProviderForm onSubmit={onSubmit} />
      </Container>
    </MainLayout>
  );
}
