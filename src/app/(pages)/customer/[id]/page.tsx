'use client';

import { useEffect, useState } from 'react';
import { useCustomers } from 'app/hooks/useCustomers';
import { Customer } from 'app/interfaces/Customer';
import Container from 'components/layout/Container';
import { HeaderForm } from 'components/layout/HeaderForm';
import MainLayout from 'components/layout/MainLayout';
import { useRouter } from 'next/navigation';

import CustomerForm from '../components/CustomerForm';

export default function CustomerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { customers, fetchCustomers, loading } = useCustomers();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const id = params.id;
  const isNew = params.id === 'new';

  useEffect(() => {
    const load = async () => {
      await fetchCustomers();
    };
    load();
  }, []);

  useEffect(() => {
    if (!isNew && customers.length > 0) {
      const found = customers.find(c => c.id === id);
      setCustomer(found || null);
    }
  }, [id, customers]);

  const handleSuccess = () => {
    router.push('/customer');
  };
  return (
    <MainLayout>
      <Container>
        <div className="flex flex-col h-full pb-4">
          <HeaderForm isCreate header="Nou Client" />
          <CustomerForm
            initialData={customer || undefined}
            onSuccess={handleSuccess}
          />
        </div>
      </Container>
    </MainLayout>
  );
}
