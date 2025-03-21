'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useProviders } from 'app/hooks/useProviders';
import { SvgSpinner } from 'app/icons/icons';
import {
  Provider,
  ProviderResponse,
  UpdateProviderRequest,
} from 'app/interfaces/Provider';
import Container from 'components/layout/Container';
import { HeaderForm } from 'components/layout/HeaderForm';
import MainLayout from 'components/layout/MainLayout';
import { Button } from 'designSystem/Button/Buttons';
import { useRouter } from 'next/navigation';

export default function ProvidersPageDetail({
  params,
}: {
  params: { id: string };
}) {
  const [provider, setProvider] = useState<ProviderResponse>();

  const {
    getById,
    updateProvider,
    addOrRemoveSparePart,
    isLoadingProvider,
    isProviderSuccessFull,
  } = useProviders(false);
  const router = useRouter();

  async function fetch() {
    const providerData = await getById(params.id);
    setProvider(providerData);
    if (providerData) {
      Object.keys(providerData).forEach(key => {
        const value = providerData[key as keyof Provider];

        const formattedValue =
          typeof value === 'boolean'
            ? value.toString()
            : value instanceof Date
            ? value.toISOString()
            : value;

        setValue(key as keyof UpdateProviderRequest, formattedValue as string);
      });
    }
  }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProviderRequest>();

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
              header={`${provider?.name} - ${provider?.phoneNumber}`}
            />
            <div className="flex flex-col bg-white p-6 rounded-md shadow-md my-4 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <form className="space-y-4 p-4 border rounded-md">
                  <div>
                    <label className="block font-medium">Nom</label>
                    <input
                      {...register('name', {
                        required: 'El nombre es obligatorio',
                      })}
                      className="w-full border rounded p-2"
                      placeholder="Nombre del proveedor"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium">NIE</label>
                    <input
                      {...register('nie', {
                        required: 'El NIE es obligatori',
                      })}
                      className="w-full border rounded p-2"
                      placeholder="NIE del proveeïdor"
                    />
                    {errors.nie && (
                      <p className="text-red-500 text-sm">
                        {errors.nie.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium">Direcció</label>
                    <input
                      {...register('address', {
                        required: 'La direcció és obligatòria',
                      })}
                      className="w-full border rounded p-2"
                      placeholder="Direcció"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium">Ciutat</label>
                      <input
                        {...register('city', {
                          required: 'La ciudad es obligatoria',
                        })}
                        className="w-full border rounded p-2"
                        placeholder="Ciudad"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm">
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block font-medium">Provincia</label>
                      <input
                        {...register('province', {
                          required: 'La provincia es obligatoria',
                        })}
                        className="w-full border rounded p-2"
                        placeholder="Provincia"
                      />
                      {errors.province && (
                        <p className="text-red-500 text-sm">
                          {errors.province.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium">Codi Postal</label>
                      <input
                        {...register('postalCode', {
                          required: 'El codi postal es obligatori',
                        })}
                        className="w-full border rounded p-2"
                        placeholder="Codi Postal"
                      />
                      {errors.postalCode && (
                        <p className="text-red-500 text-sm">
                          {errors.postalCode.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block font-medium">Telèfon</label>
                      <input
                        {...register('phoneNumber', {
                          required: 'El telèfon es obligatori',
                        })}
                        className="w-full border rounded p-2"
                        placeholder="Telèfon"
                      />
                      {errors.phoneNumber && (
                        <p className="text-red-500 text-sm">
                          {errors.phoneNumber.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium">Email</label>
                      <input
                        type="email"
                        {...register('email', {
                          required: 'El email es obligatorio',
                          pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: 'Formato de email inválido',
                          },
                        })}
                        className="w-full border rounded p-2"
                        placeholder="Email"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block font-medium">WhatsApp</label>
                      <input
                        {...register('whatsappNumber')}
                        className="w-full border rounded p-2"
                        placeholder="Número de WhatsApp"
                      />
                    </div>
                  </div>
                </form>
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

              <div className="flex justify-end gap-2">
                <Button
                  type="create"
                  customStyles={`gap-2 flex ${
                    isProviderSuccessFull && 'bg-green-500'
                  }`}
                  onClick={handleSubmit(onSubmit)}
                >
                  Guardar {isLoadingProvider && <SvgSpinner />}
                </Button>
                <Button
                  onClick={() => router.back()}
                  type="cancel"
                  customStyles="gap-2 flex"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </div>
            </div>

            <div>Històric de Comandes (comandes i recpecions)</div>
          </>
        )}
      </Container>
    </MainLayout>
  );
}
