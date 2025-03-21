'use client';

import { useForm } from 'react-hook-form';
import { useProviders } from 'app/hooks/useProviders';
import { SvgSpinner } from 'app/icons/icons';
import { ProviderRequest } from 'app/interfaces/Provider';
import Container from 'components/layout/Container';
import { HeaderForm } from 'components/layout/HeaderForm';
import MainLayout from 'components/layout/MainLayout';
import { Button } from 'designSystem/Button/Buttons';
import { useRouter } from 'next/navigation';

export default function ProviderForm() {
  const { createProvider } = useProviders();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProviderRequest>();

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
      <Container>
        <HeaderForm header="Crear Proveïdor" isCreate />
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 p-4 bg-white shadow-md rounded-md"
        >
          <div>
            <label className="block font-medium">Nom</label>
            <input
              {...register('name', { required: 'El nom és obligatori' })}
              className="w-full border rounded p-2"
              placeholder="Nom del proveïdor"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block font-medium">NIE</label>
            <input
              {...register('nie', { required: 'El NIE és obligatori' })}
              className="w-full border rounded p-2"
              placeholder="Número d'identificació"
            />
            {errors.nie && (
              <p className="text-red-500 text-sm">{errors.nie.message}</p>
            )}
          </div>

          <div>
            <label className="block font-medium">Adreça</label>
            <input
              {...register('address', { required: "L'adreça és obligatòria" })}
              className="w-full border rounded p-2"
              placeholder="Introdueix l'adreça"
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Ciutat</label>
              <input
                {...register('city', { required: 'La ciutat és obligatòria' })}
                className="w-full border rounded p-2"
                placeholder="Ciutat"
              />
              {errors.city && (
                <p className="text-red-500 text-sm">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="block font-medium">Província</label>
              <input
                {...register('province', {
                  required: 'La província és obligatòria',
                })}
                className="w-full border rounded p-2"
                placeholder="Província"
              />
              {errors.province && (
                <p className="text-red-500 text-sm">
                  {errors.province.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block font-medium">Codi Postal</label>
            <input
              {...register('postalCode', {
                required: 'El codi postal és obligatori',
              })}
              className="w-full border rounded p-2"
              placeholder="Codi postal"
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
                required: 'El telèfon és obligatori',
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

          <div>
            <label className="block font-medium">Email</label>
            <input
              type="email"
              {...register('email', {
                required: 'El correu electrònic és obligatori',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Format d'email no vàlid",
                },
              })}
              className="w-full border rounded p-2"
              placeholder="Correu electrònic"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block font-medium">Número de WhatsApp</label>
            <input
              {...register('whatsappNumber')}
              className="w-full border rounded p-2"
              placeholder="Número de WhatsApp (opcional)"
            />
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <Button
              type="create"
              customStyles="gap-2 flex"
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit)}
            >
              Crear Proveïdor {isSubmitting && <SvgSpinner />}
            </Button>
            <Button
              type="cancel"
              onClick={() => router.back()}
              customStyles="gap-2 flex"
              disabled={isSubmitting}
            >
              Cancelar {isSubmitting && <SvgSpinner />}
            </Button>
          </div>
        </form>
      </Container>
    </MainLayout>
  );
}
