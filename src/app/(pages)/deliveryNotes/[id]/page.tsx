'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import { DeliveryNote, DeliveryNoteUpdateRequest } from 'app/interfaces/DeliveryNote';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import { DeliveryNoteService } from '../../../services/deliveryNoteService';
import { DeliveryNoteDetailForm } from '../components/DeliveryNoteDetailForm';

interface DeliveryNoteDetailPageProps {
  params: { id: string };
}

export default function DeliveryNoteDetailPage({ params }: DeliveryNoteDetailPageProps) {
  const { t } = useTranslations();
  const [deliveryNote, setDeliveryNote] = useState<DeliveryNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const deliveryNoteService = new DeliveryNoteService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  useEffect(() => {
    fetchDeliveryNote();
  }, [params.id]);

  const fetchDeliveryNote = async () => {
    try {
      const response = await deliveryNoteService.getById(params.id);
      setDeliveryNote(response);
    } catch (error) {
      console.error('Error fetching delivery note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (updateRequest: DeliveryNoteUpdateRequest) => {
    try {
      const updatedDeliveryNote = await deliveryNoteService.update(updateRequest);
      setDeliveryNote(updatedDeliveryNote);

    } catch (error) {
      console.error('Error updating delivery note:', error);
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

  if (!deliveryNote) {
    return (
      <MainLayout>
        <Container>
          <div className="text-center text-red-500">
            {t('delivery.note.not.found')}
          </div>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container>
        <DeliveryNoteDetailForm deliveryNote={deliveryNote} onUpdate={handleUpdate} />
      </Container>
    </MainLayout>
  );
}