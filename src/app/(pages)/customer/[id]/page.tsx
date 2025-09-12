'use client';

import { useEffect, useState } from 'react';
import { useCustomers } from 'app/hooks/useCustomers';
import { useTranslations } from 'app/hooks/useTranslations';
import { Customer } from 'app/interfaces/Customer';
import Container from 'components/layout/Container';
import { HeaderForm } from 'components/layout/HeaderForm';
import MainLayout from 'components/layout/MainLayout';
import { EntityTable } from 'components/table/interface/tableEntitys';
import { useRouter } from 'next/navigation';

import CustomerForm from '../components/CustomerForm';

export default function CustomerPage({ params }: { params: { id: string } }) {
  const { t } = useTranslations();
  const { getById } = useCustomers();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const id = params.id;
  const isNew = params.id === 'new';

  useEffect(() => {
    const load = async () => {
      if (!isNew) {
        const response = await getById(id);
        if (response) setCustomer(response);
      }
    };
    load();
  }, []);

  const handleSuccess = () => {
    if (isNew) router.push('/customer');
  };

  const subTitle = !isNew ? `${customer?.name} - ${customer?.taxId}` : '';

  return (
    <MainLayout>
      <Container>
        <div className="flex flex-col h-full pb-4">
          <HeaderForm
            isCreate={isNew}
            header={isNew ? t('customer.create') : t('customer.edit')}
            subtitle={subTitle}
            entity={isNew ? undefined : EntityTable.CUSTOMER}
          />
          <CustomerForm
            initialData={customer || undefined}
            onSuccess={handleSuccess}
          />
        </div>
      </Container>
    </MainLayout>
  );
}
