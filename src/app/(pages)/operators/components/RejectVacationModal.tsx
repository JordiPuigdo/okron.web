'use client';

import { useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { Button } from 'designSystem/Button/Buttons';
import { Modal } from 'designSystem/Modals/Modal';

interface RejectVacationModalProps {
  onClose: () => void;
  onReject: (reason: string) => Promise<void>;
  vacationDetails: {
    startDate: string;
    endDate: string;
    operatorName?: string;
  };
}

export const RejectVacationModal = ({
  onClose,
  onReject,
  vacationDetails,
}: RejectVacationModalProps) => {
  const { t } = useTranslations();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError(t('vacation.reasonRequired'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onReject(reason);
      handleClose();
    } catch (err) {
      setError(t('vacation.rejectionError'));
      console.error('Error rejecting vacation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <Modal
      onClose={handleClose}
      isVisible={true}
      type="center"
      height="h-auto"
      width="w-full"
      className="max-w-lg mx-auto border-4 border-blue-950 p-6"
      title={t('vacation.rejectTitle')}
    >
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            {t('vacation.requestDetails')}:
          </p>
          <div className="text-sm">
            {vacationDetails.operatorName && (
              <p className="font-medium mb-1">
                {t('operator')}: {vacationDetails.operatorName}
              </p>
            )}
            <p>
              <span className="font-medium">{t('vacation.dates')}:</span>{' '}
              {vacationDetails.startDate} - {vacationDetails.endDate}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('vacation.rejectionReason')}{' '}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            rows={4}
            placeholder={t('vacation.rejectionReasonPlaceholder')}
            disabled={isSubmitting}
          />
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            onClick={handleClose}
            className="secondary"
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            className="danger"
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? t('rejecting') : t('common.save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
