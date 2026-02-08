'use client';

import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
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
import { useRouter } from 'next/navigation';

interface FamilyFormProps {
  initialData?: Family;
  onSuccess?: () => void;
}

export default function FamilyForm({
  initialData,
  onSuccess,
}: FamilyFormProps) {
  const { t } = useTranslations();
  const router = useRouter();
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

  const { families, createFamily, updateFamily, generateCode, error } =
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
    } finally {
      if (!error) {
        setTimeout(() => {
          setSuccessMessage(undefined);
        }, 3000);
        if (onSuccess) onSuccess();
      }
    }
  };

  const selectedParentFamily = families.find(f => f.id === selectedParentId);

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto flex flex-col lg:flex-row gap-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 space-y-4 p-4 border bg-white rounded-md"
        >
          <div className="flex gap-6">
            <div className="flex flex-col w-full gap-4">
              <div>
                <label className="block font-medium">{t('name')}</label>
                <input
                  {...register('name', {
                    required: t('validation.name.required'),
                  })}
                  className="w-full border rounded p-2"
                  placeholder={t('family.name.placeholder')}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block font-medium">
                  {t('family.parent')}
                </label>
                <AutocompleteSearchBar
                  elements={familyElements}
                  setCurrentId={setSelectedParentId}
                  placeholder={t('family.parent.placeholder')}
                  selectedId={selectedParentId || null}
                />
                {selectedParentId && selectedParentFamily && (
                  <div className="flex gap-4 items-center mt-2">
                    <p className="text-sm text-gray-600">
                      {t('selected')}: {selectedParentFamily.name}
                    </p>
                    <button
                      type="button"
                      className="bg-okron-btDelete hover:bg-okron-btDeleteHover text-white rounded-xl py-1 px-3 text-xs"
                      onClick={() => setSelectedParentId('')}
                    >
                      {t('delete')}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-medium">
                    {t('code.prefix')}
                  </label>
                  {selectedParentId && (
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      disabled={generatingCode}
                      title={t('generate.code.tooltip')}
                      className="bg-okron-main hover:bg-okron-mainHover text-white rounded-xl py-1 px-3 text-xs disabled:opacity-50 flex items-center gap-2"
                    >
                      {generatingCode ? (
                        <>
                          <SvgSpinner />
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
                  className="w-full border rounded p-2"
                  placeholder={t('code.prefix.placeholder')}
                />
                {errors.codePrefix && (
                  <p className="text-red-500 text-sm">
                    {errors.codePrefix.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-medium">
                  {t('code.pattern')}
                </label>
                <input
                  {...register('codePattern', {
                    required: t('validation.codePattern.required'),
                  })}
                  className="w-full border rounded p-2"
                  placeholder={t('code.pattern.placeholder')}
                />
                {errors.codePattern && (
                  <p className="text-red-500 text-sm">
                    {errors.codePattern.message}
                  </p>
                )}
              </div>

              {initialData && initialData?.id.length > 0 && (
                <div className="flex flex-col">
                  <label className="block font-medium">
                    {t('common.active')}
                  </label>
                  <input
                    type="checkbox"
                    className="border rounded p-2 w-[25px]"
                    defaultChecked={initialData?.active}
                    onChange={(e) => setValue('active' as keyof CreateFamilyRequest, e.target.checked as never)}
                  />
                </div>
              )}
            </div>
          </div>
        </form>

        <div className="lg:col-span-1">
          <Card className="sticky top-20 bg-white rounded-md p-4">
            <h3 className="text-md font-semibold text-gray-700 mb-2">
              {t('common.summary')}
            </h3>
            <ul>
              <li className="flex justify-between gap-6">
                <span>{t('family.parent')}:</span>
                <span className="font-semibold">
                  {selectedParentFamily?.name || t('none')}
                </span>
              </li>
              <li className="flex flex-col justify-between gap-6">
                <div className="flex justify-end items-end gap-4 border-t mt-6 pt-4">
                  <Button
                    type="create"
                    customStyles="gap-2 flex"
                    disabled={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                  >
                    {isEdit ? t('family.update') : t('family.create')}
                    {isSubmitting && <SvgSpinner />}
                  </Button>

                  <Button
                    type="cancel"
                    onClick={() => router.back()}
                    customStyles="gap-2 flex"
                    disabled={isSubmitting}
                  >
                    {t('common.cancel')} {isSubmitting && <SvgSpinner />}
                  </Button>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {successMessage && (
                  <p className="text-green-500 text-sm">{successMessage}</p>
                )}
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
