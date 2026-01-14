'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import {
  Budget,
  BudgetUpdateRequest,
  ConvertBudgetToDeliveryNoteRequest,
} from 'app/interfaces/Budget';
import { BudgetService } from 'app/services/budgetService';
import useRoutes from 'app/utils/useRoutes';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';
import { useRouter } from 'next/navigation';

import { BudgetDetailForm } from '../components/BudgetDetailForm';

interface BudgetDetailPageProps {
  params: { id: string };
}

export default function BudgetDetailPage({ params }: BudgetDetailPageProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const routes = useRoutes();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const budgetService = new BudgetService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  useEffect(() => {
    fetchBudget();
  }, [params.id]);

  const fetchBudget = async () => {
    try {
      const response = await budgetService.getById(params.id);
      setBudget(response);
    } catch (error) {
      console.error('Error fetching budget:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (updateRequest: BudgetUpdateRequest) => {
    try {
      const updatedBudget = await budgetService.update(updateRequest);
      setBudget(updatedBudget);
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await budgetService.delete(id);
      router.push(routes.budget.list);
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      const reactivatedBudget = await budgetService.reactivate(id);
      setBudget(reactivatedBudget);
    } catch (error) {
      console.error('Error reactivating budget:', error);
      throw error;
    }
  };

  const handleConvertToDeliveryNote = async (
    request: ConvertBudgetToDeliveryNoteRequest
  ) => {
    try {
      const deliveryNote = await budgetService.convertToDeliveryNote(request);
      router.push(routes.deliveryNote.detail(deliveryNote.id));
    } catch (error) {
      console.error('Error converting budget to delivery note:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <Container>
          <div className="flex justify-center items-center h-64">
            <SvgSpinner className="w-8 h-8" />
          </div>
        </Container>
      </MainLayout>
    );
  }

  if (!budget) {
    return (
      <MainLayout>
        <Container>
          <div className="text-center text-red-500">
            {t('budget.not.found') || 'Pressupost no trobat'}
          </div>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container>
        <BudgetDetailForm
          budget={budget}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onReactivate={handleReactivate}
          onConvertToDeliveryNote={handleConvertToDeliveryNote}
        />
      </Container>
    </MainLayout>
  );
}
