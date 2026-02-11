'use client';

import { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { ArticleType, CreateArticleRequest } from 'app/interfaces/Article';
import { HierarchicalFamilySelector } from 'components/selector/HierarchicalFamilySelector';
import { Layers, Package } from 'lucide-react';

interface BasicInfoFormProps {
  register: UseFormRegister<CreateArticleRequest>;
  errors: FieldErrors<CreateArticleRequest>;
  selectedFamilyId: string;
  setSelectedFamilyId: (id: string) => void;
  selectedArticleType: ArticleType;
  setSelectedArticleType: (type: ArticleType) => void;
  setValue: UseFormSetValue<CreateArticleRequest>;
  isEdit: boolean;
  initialData?: Partial<CreateArticleRequest> & { active?: boolean };
  t: (key: string) => string;
}

export function BasicInfoForm({
  register,
  errors,
  selectedFamilyId,
  setSelectedFamilyId,
  selectedArticleType,
  setSelectedArticleType,
  setValue,
  isEdit,
  initialData,
  t,
}: BasicInfoFormProps) {
  return (
    <div className="space-y-5">
      {/* Selector de Tipo de Artículo */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          {t('article.type')} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedArticleType(ArticleType.Component)}
            className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all ${
              selectedArticleType === ArticleType.Component
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <Package
              className={`h-6 w-6 ${
                selectedArticleType === ArticleType.Component
                  ? 'text-blue-600'
                  : 'text-gray-500'
              }`}
            />
            <div className="text-left">
              <div
                className={`font-semibold ${
                  selectedArticleType === ArticleType.Component
                    ? 'text-blue-900'
                    : 'text-gray-700'
                }`}
              >
                {t('component')}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedArticleType(ArticleType.BillOfMaterials)}
            className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all ${
              selectedArticleType === ArticleType.BillOfMaterials
                ? 'border-purple-500 bg-purple-50 shadow-md'
                : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50'
            }`}
          >
            <Layers
              className={`h-6 w-6 ${
                selectedArticleType === ArticleType.BillOfMaterials
                  ? 'text-purple-600'
                  : 'text-gray-500'
              }`}
            />
            <div className="text-left">
              <div
                className={`font-semibold ${
                  selectedArticleType === ArticleType.BillOfMaterials
                    ? 'text-purple-900'
                    : 'text-gray-700'
                }`}
              >
                {t('bill.of.materials')}
              </div>
            </div>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('description')} <span className="text-red-500">*</span>
        </label>
        <input
          {...register('description', {
            required: t('validation.description.required'),
          })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder={t('article.description.placeholder')}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('family')} <span className="text-red-500">*</span>
        </label>
        <HierarchicalFamilySelector
          selectedFamilyId={selectedFamilyId}
          onSelect={setSelectedFamilyId}
        />
        {!selectedFamilyId && (
          <p className="text-xs text-red-500 mt-1">
            {t('validation.family.required')}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('unit.price')} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            {...register('unitPrice', {
              required: t('validation.unitPrice.required'),
              valueAsNumber: true,
              min: { value: 0, message: t('validation.positive.value') },
            })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="0.00"
          />
          {errors.unitPrice && (
            <p className="text-red-500 text-sm mt-1">
              {errors.unitPrice.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('margin.percentage')}
          </label>
          <input
            type="number"
            step="0.01"
            {...register('marginPercentage', {
              valueAsNumber: true,
              min: { value: 0, message: t('validation.positive.value') },
              max: {
                value: 100,
                message: t('validation.max.percentage'),
              },
            })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="0.00"
          />
          {errors.marginPercentage && (
            <p className="text-red-500 text-sm mt-1">
              {errors.marginPercentage.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('notes')}
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder={t('article.notes.placeholder')}
        />
      </div>

      {isEdit && initialData && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="active"
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            defaultChecked={initialData?.active}
            onChange={e =>
              setValue(
                'active' as keyof CreateArticleRequest,
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
    </div>
  );
}
