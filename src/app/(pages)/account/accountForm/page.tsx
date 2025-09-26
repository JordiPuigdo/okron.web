'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { Account, CreateAccountRequest } from 'app/interfaces/Account';
import { AccountService } from 'app/services/accountService';
import Container from 'components/layout/Container';
import { HeaderForm } from 'components/layout/HeaderForm';
import MainLayout from 'components/layout/MainLayout';
import BaseForm from 'components/OkronForm/BaseForm';
import { useRouter } from 'next/navigation';

export default function AccountFormPage() {
  const { t } = useTranslations();
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
      setErrorMessage(t('code.already.exists'));
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
        <HeaderForm header={t('create.accounting.account')} isCreate />
        <BaseForm<CreateAccountRequest>
          title={t('new.accounting.account')}
          fields={[
            {
              name: 'code',
              label: t('code'),
              placeholder: t('enter.code'),
              rules: { required: t('code.required') },
            },
            {
              name: 'description',
              label: t('description'),
              placeholder: t('enter.description'),
              rules: { required: t('description.required') },
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
