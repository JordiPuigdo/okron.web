'use client';

import { useEffect, useState } from 'react';
import { VacationRequestsList } from 'app/(pages)/operators/components/VacationRequestsList';
import { useTranslations } from 'app/hooks/useTranslations';
import { useVacations } from 'app/hooks/useVacations';
import { VacationRequest } from 'app/interfaces/Vacation';
import { useSessionStore } from 'app/stores/globalStore';
import { ErrorMessage } from 'components/Alerts/ErrorMessage';
import { SuccessfulMessage } from 'components/Alerts/SuccesfullMessage';
import dayjs from 'dayjs';

import { RejectVacationModal } from '../../operators/components/RejectVacationModal';

export function VacationApprovalsTab() {
  const { t } = useTranslations();
  const { loginUser } = useSessionStore();
  const {
    fetchPendingRequests,
    approveVacationRequest,
    rejectVacationRequest,
  } = useVacations();

  const [pendingRequests, setPendingRequests] = useState<VacationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<VacationRequest | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const req = await fetchPendingRequests();
      setPendingRequests(req || []);
    } catch (error) {
      setErrorMessage(t('vacation.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (req: VacationRequest) => {
    try {
      await approveVacationRequest(req.id, { userId: loginUser?.agentId! });
      setSuccessMessage(t('vacation.approvedSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
      loadRequests();
    } catch {
      setErrorMessage(t('vacation.approveError'));
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedRequest) return;

    await rejectVacationRequest(selectedRequest.id, {
      userId: loginUser?.agentId!,
      rejectionReason: reason,
    });
    setSuccessMessage(t('vacation.rejectedSuccess'));
    setTimeout(() => setSuccessMessage(''), 3000);
    loadRequests();
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">
        {t('vacation.pendingApprovals')}
      </h1>
      <p className="text-gray-600 mb-6">
        {t('vacation.pendingApprovalsDescription')}
      </p>

      {successMessage && (
        <SuccessfulMessage title="" message={successMessage} />
      )}
      {errorMessage && <ErrorMessage title="Error" message={errorMessage} />}

      {selectedRequest && (
        <RejectVacationModal
          onClose={() => {
            setRejectModalOpen(false);
            setSelectedRequest(null);
          }}
          onReject={handleReject}
          vacationDetails={{
            startDate: dayjs(selectedRequest.startDate).format('DD/MM/YYYY'),
            endDate: dayjs(selectedRequest.endDate).format('DD/MM/YYYY'),
            operatorName: selectedRequest.operatorName,
          }}
        />
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : pendingRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-lg font-medium">
            {t('vacation.noPendingRequests')}
          </h3>
          <p className="text-gray-600 mt-2">
            {t('vacation.noPendingRequestsDescription')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <VacationRequestsList
            requests={pendingRequests}
            currentUserId={loginUser?.agentId}
          />
        </div>
      )}
    </>
  );
}
