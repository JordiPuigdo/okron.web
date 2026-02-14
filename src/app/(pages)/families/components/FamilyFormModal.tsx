'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFamilies } from 'app/hooks/useFamilies';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import {
  CreateFamilyRequest,
  Family,
  UpdateFamilyRequest,
} from 'app/interfaces/Family';
import AutocompleteSearchBar from 'components/selector/AutocompleteSearchBar';
import { ElementList } from 'components/selector/ElementList';
import { Button } from 'designSystem/Button/Buttons';
import { Modal2 } from 'designSystem/Modals/Modal';
import { X } from 'lucide-react';

interface FamilyFormModalProps {
  isVisible: boolean;
  initialData?: Family;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FamilyFormModal({
  isVisible,
  initialData,
  onSuccess,
  onCancel,
}: FamilyFormModalProps) {
  const { t } = useTranslations();
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateFamilyRequest>({
    defaultValues: {
      name: '',
      codePrefix: '',
      codePattern: '',
      parentFamilyId: undefined,
    },
  });

  const [successMessage, setSuccessMessage] = useState<string | undefined>(
    undefined
  );
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [generatingCode, setGeneratingCode] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);

  const { families, createFamily, updateFamily, generateCode, toggleActive, error } =
    useFamilies();

  const familyElements: ElementList[] = families
    .filter(f => f.id !== initialData?.id)
    .map(family => ({
      id: family.id,
      description: `${family.name} (${family.codePrefix})`,
    }));

  useEffect(() => {
    if (!isVisible) return;

    setSuccessMessage(undefined);

    if (initialData) {
      Object.keys(initialData).forEach(key => {
        const value = initialData[key as keyof Family];
        const formattedValue =
          value instanceof Date ? value.toISOString() : value;
        setValue(
          key as keyof CreateFamilyRequest,
          formattedValue as unknown as never
        );
      });
      setSelectedParentId(initialData.parentFamilyId || '');
    } else {
      reset({
        name: '',
        codePrefix: '',
        codePattern: '',
        parentFamilyId: undefined,
      });
      setSelectedParentId('');
    }
  }, [initialData, isVisible, reset, setValue]);

  useEffect(() => {
    setValue('parentFamilyId', selectedParentId || undefined);
  }, [selectedParentId, setValue]);

  const handleGenerateCode = async () => {
    if (!selectedParentId) {
      return;
    }

    setGeneratingCode(true);
    try {
      const code = await generateCode(selectedParentId);
      if (code) {
        setValue('codePrefix', code);
      }
    } finally {
      setGeneratingCode(false);
    }
  };

  const onSubmit = async (data: CreateFamilyRequest) => {
    try {
      if (isEdit) {
        const response = await updateFamily({
          ...(data as UpdateFamilyRequest),
          id: initialData!.id,
        });
        if (response) {
          setSuccessMessage(t('family.updated.successfully'));
        }
      } else {
        await createFamily(data);
        setSuccessMessage(t('family.created.successfully'));
      }

      if (!error) {
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const handleToggleActive = async () => {
    if (!initialData?.id) return;

    setIsTogglingActive(true);
    try {
      await toggleActive(initialData.id);
      setSuccessMessage(
        initialData.active
          ? t('family.deactivated.successfully')
          : t('family.activated.successfully')
      );
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (err) {
      console.error('Error toggling active state:', err);
    } finally {
      setIsTogglingActive(false);
    }
  };

  const selectedParentFamily = families.find(f => f.id === selectedParentId);

  return (
    <Modal2
      isVisible={isVisible}
      setIsVisible={() => onCancel()}
      type="center"
      width="w-full max-w-4xl"
      height="h-[85vh]"
      className="overflow-hidden flex flex-col shadow-2xl"
      closeOnEsc
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-shrink-0 p-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {isEdit ? t('family.update') : t('create.family')}
          </h2>
          <p className="text-sm text-gray-600">
            {isEdit
              ? t('family.update.description')
              : t('family.create.description')}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('name')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name', {
                  required: t('validation.name.required'),
                })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={t('family.name.placeholder')}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('family.parent')}
              </label>
              <AutocompleteSearchBar
                elements={familyElements}
                setCurrentId={setSelectedParentId}
                placeholder={t('family.parent.placeholder')}
                selectedId={selectedParentId || null}
              />
              {selectedParentId && selectedParentFamily && (
                <div className="flex items-center justify-between mt-2 p-2 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{t('selected')}:</span>{' '}
                    {selectedParentFamily.name}
                  </p>
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-100 transition-colors"
                    onClick={() => setSelectedParentId('')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {t('code.prefix')} <span className="text-red-500">*</span>
                </label>
                {selectedParentId && (
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    disabled={generatingCode}
                    title={t('generate.code.tooltip')}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-1.5 px-3 text-xs font-medium disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                  >
                    {generatingCode ? (
                      <>
                        <SvgSpinner className="h-3 w-3" />
                        {t('generating')}
                      </>
                    ) : (
                      t('generate.code')
                    )}
                  </button>
                )}
              </div>
              <input
                {...register('codePrefix', {
                  required: t('validation.codePrefix.required'),
                })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={t('code.prefix.placeholder')}
              />
              {errors.codePrefix && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.codePrefix.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('code.pattern')} <span className="text-red-500">*</span>
              </label>
              <input
                {...register('codePattern', {
                  required: t('validation.codePattern.required'),
                })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={t('code.pattern.placeholder')}
              />
              {errors.codePattern && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.codePattern.message}
                </p>
              )}
            </div>

            {initialData && initialData?.id.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="active"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  defaultChecked={initialData?.active}
                  onChange={e =>
                    setValue(
                      'active' as keyof CreateFamilyRequest,
                      e.target.checked as never
                    )
                  }
                />
                <label
                  htmlFor="active"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  {t('common.active')}
                </label>
              </div>
            )}
          </form>
        </div>

        <div className="flex-shrink-0 flex justify-between items-center gap-3 px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center gap-3 text-sm">
            {successMessage && (
              <span className="text-green-600 font-medium">{successMessage}</span>
            )}
            {error && <span className="text-red-600 font-medium">{error}</span>}
          </div>
          <div className="flex gap-3">
            {isEdit && initialData && (
              <Button
                type="delete"
                onClick={handleToggleActive}
                customStyles="px-4 py-2 gap-2 flex items-center"
                disabled={isSubmitting || isTogglingActive}
              >
                {initialData.active ? t('common.deactivate') : t('common.activate')}
                {isTogglingActive && <SvgSpinner className="h-4 w-4" />}
              </Button>
            )}
            <Button
              type="cancel"
              onClick={onCancel}
              customStyles="px-4 py-2"
              disabled={isSubmitting || isTogglingActive}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="create"
              onClick={handleSubmit(onSubmit)}
              customStyles="px-4 py-2 gap-2 flex items-center"
              disabled={isSubmitting || isTogglingActive}
            >
              {isEdit ? t('family.update') : t('family.create')}
              {isSubmitting && <SvgSpinner className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </Modal2>
  );
}
