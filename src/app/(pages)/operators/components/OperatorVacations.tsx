'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { useVacations } from 'app/hooks/useVacations';
import { useSessionStore } from 'app/stores/globalStore';
import { Button } from 'designSystem/Button/Buttons';
import { Modal } from 'designSystem/Modals/Modal';

import { VacationBalance } from './VacationBalance';
import { VacationRequestForm } from './VacationRequestForm';
import { VacationRequestsList } from './VacationRequestsList';

interface OperatorVacationsProps {
  operatorId: string;
  isAdminView?: boolean;
}

export const OperatorVacations = ({
  operatorId,
  isAdminView = false,
}: OperatorVacationsProps) => {
  const { t } = useTranslations();
  const { loginUser } = useSessionStore();
  const {
    vacationRequests,
    vacationBalance,
    fetchVacationBalance,
    fetchVacationRequests,
  } = useVacations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [operatorId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchVacationBalance(operatorId),
        fetchVacationRequests(operatorId),
      ]);
    } catch (error) {
      console.error('Error loading vacation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestSuccess = () => {
    setIsModalOpen(false);
    loadData();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t('vacation.title')}</h2>
        <Button onClick={() => setIsModalOpen(true)} className="primary">
          {t('vacation.newRequest')}
        </Button>
      </div>

      {vacationBalance && <VacationBalance balance={vacationBalance} />}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">
          {t('vacation.requestHistory')}
        </h3>
        <VacationRequestsList
          requests={vacationRequests}
          onRefresh={loadData}
          showActions={isAdminView}
          currentUserId={loginUser?.agentId}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('vacation.newRequest')}
      >
        <VacationRequestForm
          operatorId={operatorId}
          onSuccess={handleRequestSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
