'use client';

import { useEffect, useState } from 'react';
import { SvgSpinner } from 'app/icons/icons';
import { Button } from 'designSystem/Button/Buttons';
import { Modal2 } from 'designSystem/Modals/Modal';
import { FolderPlus } from 'lucide-react';

interface AddFolderModalProps {
  isVisible: boolean;
  autoCode: string;
  onClose: () => void;
  onConfirm: (code: string, description: string) => Promise<void>;
  t: (key: string) => string;
}

export function AddFolderModal({
  isVisible,
  autoCode,
  onClose,
  onConfirm,
  t,
}: AddFolderModalProps) {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setDescription('');
    }
  }, [isVisible]);

  const isFormValid = description.trim() !== '';

  const handleConfirm = async () => {
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm(autoCode, description.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal2
      isVisible={isVisible}
      setIsVisible={onClose}
      type="center"
      width="w-full max-w-md"
      height="h-auto"
      className="overflow-hidden flex flex-col shadow-2xl"
      closeOnEsc
    >
      <div className="flex flex-col">
        <div className="px-6 py-4 border-b bg-amber-50">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-white rounded-lg w-9 h-9 flex items-center justify-center">
              <FolderPlus className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {t('assemblyBudget.addFolder')}
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('code')}
            </label>
            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600 font-mono">
              {autoCode}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('description')} *
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('assemblyBudget.folder.description.placeholder')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleConfirm()}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button type="cancel" onClick={onClose} customStyles="px-4 py-2">
            {t('common.cancel')}
          </Button>
          <Button
            type="create"
            onClick={handleConfirm}
            customStyles="px-4 py-2 gap-2 flex items-center"
            disabled={!isFormValid || isSubmitting}
          >
            <FolderPlus className="h-4 w-4" />
            {t('create')}
            {isSubmitting && <SvgSpinner className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </Modal2>
  );
}
