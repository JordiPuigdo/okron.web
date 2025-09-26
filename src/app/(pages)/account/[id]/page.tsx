'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { UpdateAccountRequest } from 'app/interfaces/Account';
import { AccountService } from 'app/services/accountService';
import Container from 'components/layout/Container';
import { HeaderForm } from 'components/layout/HeaderForm';
import MainLayout from 'components/layout/MainLayout';
import BaseForm from 'components/OkronForm/BaseForm';
import { useRouter } from 'next/navigation';

export default function AccountDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  const { t } = useTranslations();
  const accountService = new AccountService();
  const [Account, setAccount] = useState<UpdateAccountRequest>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {
    accountService.getById(id).then(data => {
      setAccount(data);
      setIsLoadingPage(false);
    });
  }, []);

  const router = useRouter();

  async function handleUpdate(data: UpdateAccountRequest): Promise<void> {
    setIsLoading(true);
    accountService
      .update(data)
      .then(data => {
        setIsUpdated(true);
        router.push(`/account`);
      })
      .catch(error => {
        console.error('Error updating cost center:', error);
        setIsLoading(false);
      });
  }

  return (
    <MainLayout>
      <Container>
        <HeaderForm
          isCreate={false}
          header={`${Account?.code} - ${Account?.description}`}
        />
        {!isLoadingPage && (
          <BaseForm<UpdateAccountRequest>
            title={t('update.accounting.account')}
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
              {
                name: 'active',
                label: t('active'),
                placeholder: t('enter.description'),
                type: 'checkbox',
                rules: { required: t('description.required') },
              },
            ]}
            onSubmit={handleUpdate}
            onCancel={() => router.back()}
            defaultValues={Account}
            isSubmitting={isLoading}
            isSubmitted={isUpdated}
          />
        )}
      </Container>
    </MainLayout>
  );
}
