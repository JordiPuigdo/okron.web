'use client';

import { useForm } from 'react-hook-form';
import { useTranslations } from 'app/hooks/useTranslations';
import { useWareHouses } from 'app/hooks/useWareHouses';
import { SvgSpinner } from 'app/icons/icons';
import { WareHouseRequest } from 'app/interfaces/WareHouse';
import Container from 'components/layout/Container';
import { HeaderForm } from 'components/layout/HeaderForm';
import MainLayout from 'components/layout/MainLayout';
import { Button } from 'designSystem/Button/Buttons';
import { useRouter } from 'next/navigation';

export default function WareHouseForm() {
  const { t } = useTranslations();
  const { createWareHouse, warehouses } = useWareHouses(true);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WareHouseRequest>();
  const onSubmit = async (data: WareHouseRequest) => {
    try {
      if (
        warehouses.find(
          x => x.code.toLocaleUpperCase() == data?.code.toLocaleUpperCase()
        )
      ) {
        alert(t('warehouse.codeExists'));
        return;
      }
      const wareHouse = await createWareHouse(data);
      router.push(`/wareHouse/${wareHouse.id}`);
    } catch (error) {
      console.error('Error creating warehouse:', error);
    }
  };

  return (
    <MainLayout>
      <Container>
        <HeaderForm header={t('warehouse.createWarehouse')} isCreate />
        <div className="flex flex-row gap-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 p-4 bg-white shadow-md rounded-md"
          >
            <div>
              <label className="block font-medium">{t('warehouse.warehouseCode')}</label>
              <input
                {...register('code', { required: t('warehouse.codeRequired') })}
                className="w-full border rounded p-2"
                placeholder={t('warehouse.enterCode')}
              />
              {errors.code && (
                <p className="text-red-500 text-sm">{errors.code.message}</p>
              )}
            </div>
            <div>
              <label className="block font-medium">{t('description')}</label>
              <input
                {...register('description', {
                  required: t('warehouse.descriptionRequired'),
                })}
                className="w-full border rounded p-2"
                placeholder={t('warehouse.enterDescription')}
              />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block font-medium">{t('warehouse.virtual')}</label>
              <input
                {...register('isVirtual', {})}
                className="w-full border rounded p-2"
                type="checkbox"
              />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex flex-row gap-4">
              <Button
                onClick={handleSubmit(onSubmit)}
                type="create"
                customStyles="gap-2 flex"
                disabled={isSubmitting}
              >
                {t('warehouse.createWarehouse')} {isSubmitting && <SvgSpinner />}
              </Button>
              <Button
                onClick={() => router.back()}
                type="cancel"
                customStyles="gap-2 flex"
                disabled={isSubmitting}
              >
                {t('common.cancel')} {isSubmitting && <SvgSpinner />}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </MainLayout>
  );
}
