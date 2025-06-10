'use client';
import { useEffect, useState } from 'react';
import { Account, CreateAccountRequest } from 'app/interfaces/Account';
import { AccountService } from 'app/services/accountService';
import Container from 'components/layout/Container';
import { HeaderForm } from 'components/layout/HeaderForm';
import MainLayout from 'components/layout/MainLayout';
import BaseForm from 'components/OkronForm/BaseForm';
import { useRouter } from 'next/navigation';

export default function AccountFormPage() {
  const router = useRouter();
  const accountService = new AccountService();
  const [Account, setAccount] = useState<Account[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    accountService.getAll().then(data => {
      setAccount(data);
    });
  }, []);

  async function handleCreate(data: CreateAccountRequest): Promise<void> {
    if (
      Account.find(
        x => x.code.toLocaleUpperCase() == data.code.toLocaleUpperCase()
      )
    ) {
      setErrorMessage('El codi ja existeix');
      setTimeout(() => {
        setErrorMessage(undefined);
      }, 2000);
      return;
    }
    accountService.create(data).then(data => {
      router.push(`/account`);
    });
  }

  return (
    <MainLayout>
      <Container>
        <HeaderForm header="Crear Compte Comptable" isCreate />
        <BaseForm<CreateAccountRequest>
          title="Nou Compta Comptable"
          fields={[
            {
              name: 'code',
              label: 'Codi',
              placeholder: 'Introdueix el codi',
              rules: { required: 'El codi és obligatori' },
            },
            {
              name: 'description',
              label: 'Descripció',
              placeholder: 'Introdueix la descripció',
              rules: { required: 'La descripció és obligatòria' },
            },
          ]}
          onSubmit={handleCreate}
          onCancel={() => router.back()}
          errorMessage={errorMessage}
        />
      </Container>
    </MainLayout>
  );
}
