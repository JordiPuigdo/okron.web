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
import { X } from 'lucide-react';

interface FamilyFormModalProps {
  initialData?: Family;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FamilyFormModal({
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
    formState: { errors, isSubmitting },
  } = useForm<CreateFamilyRequest>();

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
      if (initialData.parentFamilyId) {
        setSelectedParentId(initialData.parentFamilyId);
      }
    }
  }, [initialData, setValue]);

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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? t('family.update') : t('create.family')}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {isEdit
              ? t('family.update.description')
              : t('family.create.description')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Nombre */}
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

        {/* Familia Padre */}
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

        {/* Código Prefijo */}
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

        {/* Patrón de Código */}
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

        {/* Active checkbox (solo para edición) */}
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

        {/* Mensajes de error/éxito */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between items-center gap-3 pt-4 border-t">
          <div>
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
          </div>
          <div className="flex gap-3">
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
      </form>
    </div>
  );
}
