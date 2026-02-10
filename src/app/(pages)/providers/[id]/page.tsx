'use client';
import { useEffect, useState } from 'react';
import { TableDataOrders } from 'app/(pages)/orders/components/TableDataOrders';
import { useProviders } from 'app/hooks/useProviders';
import { useTranslations } from 'app/hooks/useTranslations';
import { OrderType } from 'app/interfaces/Order';
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
  const [searchTerm, setSearchTerm] = useState('');
  const { getById, updateProvider, deleteProvider, changeActiveField, isLoadingProvider, isProviderSuccessFull } =
    useProviders(false);
  const { t } = useTranslations();

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

  const handleDelete = async () => {
    if (!confirm(t('deleteProviderConfirm'))) {
      return;
    }
    try {
      await deleteProvider(params.id);
      window.location.href = '/providers';
    } catch (error) {
      console.error('Error deleting provider:', error);
    }
  };

  const handleChangeActive = async () => {
    const newActiveState = !provider?.active;
    const confirmMessage = newActiveState
      ? t('activateProviderConfirm')
      : t('deactivateProviderConfirm');
    
    if (!confirm(confirmMessage)) {
      return;
    }
    try {
      await changeActiveField(params.id, newActiveState);
      await fetch();
    } catch (error) {
      console.error('Error changing provider active status:', error);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const filteredStock = provider?.providerSpareParts.filter(
    x =>
      x.sparePart?.code
        .toLocaleLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      x.sparePart?.description
        .toLocaleLowerCase()
        .includes(searchTerm.toLocaleLowerCase())
  );

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
                <ProviderForm
                  providerData={provider}
                  onSubmit={onSubmit}
                  onDelete={handleDelete}
                  onChangeActive={handleChangeActive}
                  isDeleting={isLoadingProvider}
                />
                <div className="bg-white p-4 border rounded-md">
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Buscar per codi o descripció..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 border-b">
                      <div className="col-span-3 md:col-span-2">Codi</div>
                      <div className="col-span-6 md:col-span-8">Descripció</div>
                      <div className="col-span-3 md:col-span-2 text-right">
                        Preu
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {filteredStock?.map((x, index) => (
                        <div
                          key={x.sparePart?.id}
                          className="grid grid-cols-12 px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <div className="col-span-3 md:col-span-2 font-medium text-gray-900">
                            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">
                              {x.sparePart?.code}
                            </span>
                          </div>
                          <div className="col-span-6 md:col-span-8 text-gray-600">
                            {x.sparePart?.description}
                          </div>
                          <div className="col-span-3 md:col-span-2 text-right font-medium text-gray-900">
                            {x.price} €
                          </div>
                        </div>
                      ))}
                    </div>

                    {!filteredStock?.length && (
                      <div className="p-8 text-center text-gray-500">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                        <p className="mt-2 text-sm">No spare parts found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 my-4 w-full bg-white rounded-xl p-4 shadow-md">
              <TableDataOrders
                selectedProviderId={params.id}
                title="Històric de compres"
                hideShadow
                enableFilters={false}
              />
            </div>
          </>
        )}
      </Container>
    </MainLayout>
  );
}
