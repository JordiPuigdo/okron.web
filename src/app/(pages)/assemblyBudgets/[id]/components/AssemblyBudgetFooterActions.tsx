'use client';

import React from 'react';
import { SvgSpinner } from 'app/icons/icons';
import { Button } from 'designSystem/Button/Buttons';
import { Save } from 'lucide-react';

interface AssemblyBudgetFooterActionsProps {
  isSubmitting: boolean;
  successMessage?: string;
  onSubmit: () => void;
  onCancel: () => void;
  t: (key: string) => string;
}

export const AssemblyBudgetFooterActions = React.memo(
  function AssemblyBudgetFooterActions({
    isSubmitting,
    successMessage,
    onSubmit,
    onCancel,
    t,
  }: AssemblyBudgetFooterActionsProps) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between sticky bottom-4">
        <div className="text-sm">
          {successMessage && (
            <span className="text-green-600 font-medium">
              {successMessage}
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <Button type="cancel" onClick={onCancel} customStyles="px-5 py-2.5">
            {t('common.cancel')}
          </Button>
          <Button
            type="create"
            onClick={onSubmit}
            customStyles="px-5 py-2.5 gap-2 flex items-center"
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4" />
            {t('save')}
            {isSubmitting && <SvgSpinner className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    );
  }
);
