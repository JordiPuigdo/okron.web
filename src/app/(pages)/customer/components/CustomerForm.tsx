'use client';

import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';
import { useCustomers } from 'app/hooks/useCustomers';
import { SvgSpinner } from 'app/icons/icons';
import {
  CreateCustomerRequest,
  Customer,
  UpdateCustomerRequest,
} from 'app/interfaces/Customer';
import { Button } from 'designSystem/Button/Buttons';
import { useRouter } from 'next/navigation';

import { CustomerAddressList } from './CustomerAddressList';
import { CustomerContactList } from './CustomerContactList';
import CustomerInstallationList from './CustomerInstallation/CustomerInstallationList';
import { CustomerPaymentMethods } from './CustomerPaymentMethods';
import { CustomerRatesManager } from './CustomerRatesManager';

interface CustomerFormProps {
  initialData?: Customer;
  onSuccess?: () => void;
}

enum CustomerFormTabs {
  GENERAL = 'General',
  PAYMENTMETHODS = 'Pagaments',
  INSTALLATIONS = 'Botigues',
}

export default function CustomerForm({
  initialData,
  onSuccess,
}: CustomerFormProps) {
  const tabs = [
    CustomerFormTabs.GENERAL,
    CustomerFormTabs.PAYMENTMETHODS,
    CustomerFormTabs.INSTALLATIONS,
  ];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const router = useRouter();
  const isEdit = !!initialData;

  const methods = useForm<CreateCustomerRequest>();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = methods;

  const { watch } = methods;
  const addressCount = watch('address')?.length || 0;
  const contactsCount = watch('contacts')?.length || 0;
  const ratesCount = watch('rates')?.length || 0;
  const installationsCount = watch('installations')?.length || 0;
  const [successMessage, setSuccessMessage] = useState<string | undefined>(
    undefined
  );

  const { createCustomer, updateCustomer, getNewCustomerCode, error } =
    useCustomers();

  const fetchCode = async () => {
    const code = await getNewCustomerCode();
    setValue('code', code!);
  };

  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach(key => {
        const value = initialData[key as keyof Customer];

        const formattedValue =
          value instanceof Date ? value.toISOString() : value;

        setValue(
          key as keyof CreateCustomerRequest,
          formattedValue as unknown as never
        );
      });
    } else {
      if (!initialData) fetchCode();
    }
  }, [initialData, setValue]);

  const onSubmit = async (data: CreateCustomerRequest) => {
    if (isEdit) {
      const response = await updateCustomer({
        ...(data as UpdateCustomerRequest),
        id: initialData!.id,
      });
      if (response) {
        setSuccessMessage('Client actualitzat correctament');
      }
    } else {
      await createCustomer(data);
    }

    setTimeout(() => {
      setSuccessMessage(undefined);
    }, 3000);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto flex flex-col lg:flex-row gap-6">
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 space-y-4 p-4 border bg-white rounded-md"
          >
            <nav className="flex space-x-4 border-b border-gray-300">
              {tabs.map(tab => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    relative
                    py-3 px-6
                    font-semibold
                    text-sm
                    transition
                    duration-300
                    rounded-t-md
                    focus:outline-none
                    ${
                      activeTab === tab
                        ? 'text-okron-main border-b-4 border-okron-main font-bold'
                        : 'text-gray-500 hover:text-okron-main hover:border-b-4 hover:border-okron-main'
                    }
            `}
                  style={{ color: activeTab === tab ? '#59408F' : undefined }}
                >
                  {tab}
                  {activeTab === tab && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-1 rounded-t-md"
                      style={{ backgroundColor: '#59408F' }}
                    />
                  )}
                </button>
              ))}
            </nav>

            {activeTab === CustomerFormTabs.GENERAL && (
              <div className="flex gap-6">
                <div className="flex flex-col w-full gap-4">
                  <div>
                    <label className="block font-medium">Codi</label>
                    <input
                      {...register('code', {
                        required: 'El codi és obligatori',
                      })}
                      className="w-full border rounded p-2"
                      placeholder="Codi client"
                      disabled
                    />
                    {errors.code && (
                      <p className="text-red-500 text-sm">
                        {errors.code.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium">Nom</label>
                    <input
                      {...register('name', {
                        required: 'El nom és obligatori',
                      })}
                      className="w-full border rounded p-2"
                      placeholder="Nom client"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium">Nom Fiscal</label>
                    <input
                      {...register('fiscalName')}
                      className="w-full border rounded p-2"
                      placeholder="Número de compte"
                    />
                  </div>

                  <div>
                    <label className="block font-medium">NIF/CIF</label>
                    <input
                      {...register('taxId')}
                      className="w-full border rounded p-2"
                      placeholder="NIF o CIF"
                    />
                  </div>

                  <div>
                    <label className="block font-medium">Email</label>
                    <input
                      {...register('email')}
                      className="w-full border rounded p-2"
                      placeholder="Email"
                    />
                  </div>

                  <div>
                    <label className="block font-medium">
                      Número de compte
                    </label>
                    <input
                      {...register('accountNumber')}
                      className="w-full border rounded p-2"
                      placeholder="Número de compte"
                    />
                  </div>
                  <div>
                    <label className="block font-medium">Telèfon</label>
                    <input
                      {...register('phoneNumber')}
                      className="w-full border rounded p-2"
                      placeholder="Número de compte"
                    />
                  </div>
                  <div>
                    <label className="block font-medium">Whatsapp</label>
                    <input
                      {...register('whatsappNumber')}
                      className="w-full border rounded p-2"
                      placeholder="Número de compte"
                    />
                  </div>
                  {initialData && initialData?.id.length > 0 && (
                    <div className="flex flex-col">
                      <label className="block font-medium">Actiu</label>
                      <input
                        type="checkbox"
                        {...register('active')}
                        className="border rounded p-2 w-[25px]"
                        defaultChecked={initialData?.active}
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col w-full">
                  {initialData && initialData?.address?.length > 0 && (
                    <div>
                      <label className="block font-medium">
                        Adreça Principal
                      </label>
                      <input
                        value={initialData.address[0].address}
                        disabled
                        className="w-full border rounded p-2"
                      />
                    </div>
                  )}
                  {activeTab === CustomerFormTabs.GENERAL && (
                    <CustomerAddressList />
                  )}
                </div>
              </div>
            )}

            {activeTab === CustomerFormTabs.GENERAL && <CustomerContactList />}
            {activeTab === CustomerFormTabs.PAYMENTMETHODS && (
              <CustomerPaymentMethods />
            )}
            {activeTab === CustomerFormTabs.PAYMENTMETHODS && (
              <CustomerRatesManager customerId={initialData?.id || ''} />
            )}
            {activeTab === CustomerFormTabs.INSTALLATIONS && (
              <CustomerInstallationList />
            )}
          </form>
        </FormProvider>
        <div className="lg:col-span-1">
          <Card className="sticky top-20 bg-white rounded-md p-4">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Resum</h3>
            <ul>
              <li className="flex justify-between gap-6">
                <span>Direccions:</span>
                <span className="font-semibold">{addressCount}</span>
              </li>
              <li className="flex justify-between gap-6">
                <span>Contactes:</span>
                <span className="font-semibold">{contactsCount}</span>
              </li>
              <li className="flex justify-between gap-6">
                <span>Tarifes:</span>
                <span className="font-semibold">{ratesCount}</span>
              </li>
              <li className="flex justify-between gap-6">
                <span>Botigues:</span>
                <span className="font-semibold">{installationsCount}</span>
              </li>
              <li className="flex flex-col justify-between gap-6">
                <div className="flex justify-end items-end gap-4 border-t mt-6 pt-4">
                  <Button
                    type="create"
                    customStyles="gap-2 flex"
                    disabled={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                  >
                    {isEdit ? 'Actualitzar Client' : 'Crear Client'}
                    {isSubmitting && <SvgSpinner />}
                  </Button>

                  <Button
                    type="cancel"
                    onClick={() => router.back()}
                    customStyles="gap-2 flex"
                    disabled={isSubmitting}
                  >
                    Cancel·lar {isSubmitting && <SvgSpinner />}
                  </Button>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {successMessage && (
                  <p className="text-green-500 text-sm">{successMessage}</p>
                )}
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
