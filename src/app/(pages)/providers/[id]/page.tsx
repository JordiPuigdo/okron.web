'use client';
import { useEffect, useState } from 'react';
import { useProviders } from 'app/hooks/useProviders';
import { SvgSpinner } from 'app/icons/icons';
import {
  ProviderResponse,
  UpdateProviderRequest,
} from 'app/interfaces/Provider';
import { formatDate } from 'app/utils/utils';
import Container from 'components/layout/Container';
import { HeaderForm } from 'components/layout/HeaderForm';
import MainLayout from 'components/layout/MainLayout';

import ProviderForm from '../ProviderForm/ProviderForm';

export default function ProvidersPageDetail({
  params,
}: {
  params: { id: string };
}) {
  const [provider, setProvider] = useState<ProviderResponse>();

  const { getById, updateProvider, isLoadingProvider, isProviderSuccessFull } =
    useProviders(false);

  async function fetch() {
    const providerData = await getById(params.id);
    setProvider(providerData);
  }

  const onSubmit = async (data: UpdateProviderRequest) => {
    try {
      await updateProvider(data);
    } catch (error) {
      console.error('Error creating provider:', error);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <MainLayout>
      <Container>
        {provider && (
          <>
            <HeaderForm
              isCreate={false}
              header={`${provider?.name} - ${
                provider?.phoneNumber
              } - Alta: ${formatDate(provider?.creationDate, false)}`}
            />
            <div className="flex flex-col bg-white p-6 rounded-md shadow-md my-4 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProviderForm providerData={provider} onSubmit={onSubmit} />
                <div className="bg-white p-4 border rounded-md">
                  <h3 className="font-semibold mb-2">
                    Llistat de Recanvis Assignats Pdt Buscador RESOLVER
                  </h3>
                  <div className="flex flex-col w-full gap-2">
                    <div className="flex justify-between gap-2 p-2 bg-gray-200">
                      <div>Codi</div>
                      <div>Descripció</div>
                      <div>Preu</div>
                    </div>
                    {provider?.providerSpareParts?.map(x => (
                      <div key={x.sparePart?.id} className="p-2 border-b">
                        <div className="flex justify-between gap-2">
                          <div>{x.sparePart?.code}</div>
                          <div>{x.sparePart?.description}</div>
                          <div>{x.price} €</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>Històric de Comandes (comandes i recpecions)</div>
          </>
        )}
      </Container>
    </MainLayout>
  );
}
