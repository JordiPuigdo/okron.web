'use client';

import { useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { useVacations } from 'app/hooks/useVacations';
import { VacationRequest, VacationStatus } from 'app/interfaces/Vacation';
import { ErrorMessage } from 'components/Alerts/ErrorMessage';
import { SuccessfulMessage } from 'components/Alerts/SuccesfullMessage';
import dayjs from 'dayjs';

import { RejectVacationModal } from './RejectVacationModal';

interface VacationRequestsListProps {
  requests: VacationRequest[];
  onRefresh?: () => void;
  showActions?: boolean;
  currentUserId?: string;
}

export const VacationRequestsList = ({
  requests,
  onRefresh,
  showActions = true,
  currentUserId,
}: VacationRequestsListProps) => {
  const { t } = useTranslations();
  const {
    approveVacationRequest,
    rejectVacationRequest,
    cancelVacationRequest,
    reactivateVacationRequest,
  } = useVacations();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );
  const [selectedRequest, setSelectedRequest] =
    useState<VacationRequest | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const getStatusColor = (status: VacationStatus): string => {
    switch (status) {
      case VacationStatus.Pending:
        return 'bg-yellow-100 text-yellow-800';
      case VacationStatus.Approved:
        return 'bg-green-100 text-green-800';
      case VacationStatus.Rejected:
        return 'bg-red-100 text-red-800';
      case VacationStatus.Cancelled:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: VacationStatus): string => {
    switch (status) {
      case VacationStatus.Pending:
        return t('vacation.status.pending');
      case VacationStatus.Approved:
        return t('vacation.status.approved');
      case VacationStatus.Rejected:
        return t('vacation.status.rejected');
      case VacationStatus.Cancelled:
        return t('vacation.status.cancelled');
      default:
        return '';
    }
  };

  const handleApprove = async (id: string) => {
    console.log(currentUserId);

    if (!currentUserId) return;

    try {
      await approveVacationRequest(id, { userId: currentUserId });
      setSuccessMessage(t('vacation.approvedSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error approving request:', error);
      setErrorMessage(t('vacation.approveError'));
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleOpenRejectModal = (request: VacationRequest) => {
    setSelectedRequest(request);
    setSelectedRequestId(request.id);
    setRejectModalOpen(true);
  };

  const handleReject = async (reason: string) => {
    console.log(currentUserId, selectedRequestId);
    if (!currentUserId || !selectedRequestId) return;

    try {
      await rejectVacationRequest(selectedRequestId, {
        userId: currentUserId,
        rejectionReason: reason,
      });
      setSuccessMessage(t('vacation.rejectedSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error; // Let modal handle the error
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm(t('vacation.confirmCancel'))) return;

    try {
      await cancelVacationRequest(id);
      setSuccessMessage(t('vacation.cancelledSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error cancelling request:', error);
      setErrorMessage(t('vacation.cancelError'));
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleReactivate = async (id: string) => {
    if (!confirm(t('vacation.confirmReactivate'))) return;

    try {
      await reactivateVacationRequest(id);
      setSuccessMessage(t('vacation.reactivatedSuccess'));
      setTimeout(() => setSuccessMessage(''), 3000);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error reactivating request:', error);
      setErrorMessage(t('vacation.reactivateError'));
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const canApprove = showActions;

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('vacation.noRequests')}
      </div>
    );
  }

  // Separate pending requests from others for better UX
  const pendingRequests = requests.filter(
    r => r.status === VacationStatus.Pending
  );
  const otherRequests = requests.filter(
    r => r.status !== VacationStatus.Pending
  );

  const renderRequest = (request: VacationRequest, isPending = false) => (
    <div
      key={request.id}
      className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
        isPending ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
      }`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-lg">
              {request.operatorName} -
            </span>
            <span className="font-semibold text-lg">
              {dayjs(request.startDate).format('DD/MM/YYYY')} -{' '}
              {dayjs(request.endDate).format('DD/MM/YYYY')}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                request.status
              )}`}
            >
              {getStatusText(request.status)}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {request.totalDays} {t('days')}
            </span>
          </div>
          {request.reason && (
            <div className="text-sm text-gray-700 mt-2 italic">
              "{request.reason}"
            </div>
          )}
          {request.rejectionReason && (
            <div className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded">
              <span className="font-medium">{t('vacation.rejection')}:</span>{' '}
              {request.rejectionReason}
            </div>
          )}
          {request.approvedDate && (
            <div className="text-xs text-gray-500 mt-1">
              {t('vacation.approvedOn')}{' '}
              {dayjs(request.approvedDate).format('DD/MM/YYYY')}
            </div>
          )}
        </div>

        {canApprove && request.status === VacationStatus.Pending && (
          <div className="flex gap-2">
            <button
              onClick={() => handleApprove(request.id)}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {t('vacation.approve')}
            </button>
            <button
              onClick={() => handleOpenRejectModal(request)}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              {t('vacation.reject')}
            </button>
          </div>
        )}
        {canApprove && request.status === VacationStatus.Approved && (
          <button
            onClick={() => handleCancel(request.id)}
            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
          >
            {t('common.cancel')}
          </button>
        )}
        {canApprove && request.status === VacationStatus.Cancelled && (
          <button
            onClick={() => handleReactivate(request.id)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {t('vacation.reactivate')}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {successMessage && (
        <SuccessfulMessage title="" message={successMessage} />
      )}
      {errorMessage && <ErrorMessage title="" message={errorMessage} />}

      {selectedRequest && (
        <RejectVacationModal
          onClose={() => {
            setRejectModalOpen(false);
            setSelectedRequest(null);
            setSelectedRequestId(null);
          }}
          onReject={handleReject}
          vacationDetails={{
            startDate: dayjs(selectedRequest.startDate).format('DD/MM/YYYY'),
            endDate: dayjs(selectedRequest.endDate).format('DD/MM/YYYY'),
          }}
        />
      )}

      {pendingRequests.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-yellow-700 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            {t('vacation.pendingRequests')} ({pendingRequests.length})
          </h4>
          <div className="space-y-3">
            {pendingRequests.map(req => renderRequest(req, true))}
          </div>
        </div>
      )}

      {otherRequests.length > 0 && (
        <div>
          {pendingRequests.length > 0 && (
            <h4 className="text-md font-semibold text-gray-700 mb-3">
              {t('vacation.history')}
            </h4>
          )}
          <div className="space-y-3">
            {otherRequests.map(req => renderRequest(req, false))}
          </div>
        </div>
      )}
    </div>
  );
};
