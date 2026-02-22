'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import InspectionPoint from 'app/interfaces/inspectionPoint';
import InspectionPointService from 'app/services/inspectionPointService';
import { Button } from 'designSystem/Button/Buttons';
import { Modal2 } from 'designSystem/Modals/Modal';
import { ClipboardList } from 'lucide-react';

interface InspectionPointFormModalProps {
  isVisible: boolean;
  initialData?: InspectionPoint;
  onSuccess: (inspectionPoint?: InspectionPoint) => void;
  onCancel: () => void;
}

export function InspectionPointFormModal({
  isVisible,
  initialData,
  onSuccess,
  onCancel,
}: InspectionPointFormModalProps) {
  const { t } = useTranslations();
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InspectionPoint>({
    defaultValues: {
      id: '',
      description: '',
      active: true,
    },
  });

  const [successMessage, setSuccessMessage] = useState<string | undefined>(
    undefined
  );
  const [displayError, setDisplayError] = useState<string | undefined>(
    undefined
  );

  const inspectionPointService = new InspectionPointService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  useEffect(() => {
    if (!isVisible) return;

    setSuccessMessage(undefined);
    setDisplayError(undefined);

    if (initialData) {
      reset({
        id: initialData.id,
        description: initialData.description,
        active: initialData.active,
      });
    } else {
      reset({
        id: '',
        description: '',
        active: true,
      });
    }
  }, [isVisible, initialData, reset]);

  const onSubmit = async (data: InspectionPoint) => {
    try {
      const submitData: InspectionPoint = {
        id: data.id,
        description: data.description,
        active: data.active,
      };

      let resultInspectionPoint: InspectionPoint | undefined;

      if (isEdit) {
        await inspectionPointService.updateInspectionPoint(
          initialData!.id,
          submitData
        );
        setSuccessMessage(t('point.updated.successfully'));
        resultInspectionPoint = { ...submitData, id: initialData!.id };
      } else {
        const created = await inspectionPointService.createInspectionPoint(
          submitData
        );
        setSuccessMessage(t('inspection.point.created.successfully'));
        resultInspectionPoint = created;
      }

      if (resultInspectionPoint) {
        setTimeout(() => {
          onSuccess(resultInspectionPoint);
        }, 2000);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setDisplayError(
        err instanceof Error
          ? err.message
          : t('error.updating.inspection.point')
      );
    }
  };

  return (
    <Modal2
      isVisible={isVisible}
      setIsVisible={onCancel}
      type="center"
      width="w-full max-w-2xl"
      height="h-auto"
      className="overflow-hidden flex flex-col shadow-2xl"
      closeOnEsc
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-shrink-0 p-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {isEdit
                  ? t('update.inspection.point')
                  : t('create.inspection.point')}
              </h2>
              <p className="text-sm text-gray-600">
                {isEdit
                  ? t('edit.inspection.point.description')
                  : t('create.new.inspection.point.description')}
              </p>
            </div>
            <div className="ml-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ClipboardList className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('description')}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  {...register('description', {
                    required: t('description.required'),
                  })}
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t('enter.description')}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  {...register('active')}
                  type="checkbox"
                  id="active"
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label
                  htmlFor="active"
                  className="text-sm font-medium text-gray-700"
                >
                  {t('active')}
                </label>
              </div>
            </div>
          </form>
        </div>

        <div className="flex-shrink-0 flex justify-between items-center gap-3 px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center gap-3 text-sm">
            {successMessage && (
              <span className="text-green-600 font-medium">
                {successMessage}
              </span>
            )}
            {displayError && (
              <span className="text-red-600 font-medium">{displayError}</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="cancel"
              onClick={onCancel}
              customStyles="px-5 py-2.5"
              disabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
            <Button
              type="create"
              onClick={handleSubmit(onSubmit)}
              customStyles="px-5 py-2.5 gap-2 flex items-center"
              disabled={isSubmitting}
            >
              {isEdit ? t('update') : t('create')}
              {isSubmitting && <SvgSpinner className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </Modal2>
  );
}
