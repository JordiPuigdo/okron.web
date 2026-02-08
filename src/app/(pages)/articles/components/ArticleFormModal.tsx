'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useArticles } from 'app/hooks/useArticles';
import { useProviders } from 'app/hooks/useProviders';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import {
  Article,
  ArticleType,
  CreateArticleComponentRequest,
  CreateArticleProviderRequest,
  CreateArticleRequest,
  UpdateArticleRequest,
} from 'app/interfaces/Article';
import { Provider } from 'app/interfaces/Provider';
import AutocompleteSearchBar from 'components/selector/AutocompleteSearchBar';
import { ElementList } from 'components/selector/ElementList';
import { HierarchicalFamilySelector } from 'components/selector/HierarchicalFamilySelector';
import { Button } from 'designSystem/Button/Buttons';
import { Edit2,Layers, Package, Plus, Trash2, Users } from 'lucide-react';

interface ArticleFormModalProps {
  initialData?: Article;
  onSuccess: () => void;
  onCancel: () => void;
}

type TabType = 'basic' | 'providers' | 'components';

export function ArticleFormModal({
  initialData,
  onSuccess,
  onCancel,
}: ArticleFormModalProps) {
  const { t } = useTranslations();
  const isEdit = !!initialData;
  const [activeTab, setActiveTab] = useState<TabType>('basic');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateArticleRequest>({
    defaultValues: {
      description: initialData?.description || '',
      articleType: initialData?.articleType ?? ArticleType.Component,
      unitPrice: initialData?.unitPrice || 0,
      marginPercentage: initialData?.marginPercentage || 0,
      familyId: initialData?.familyId || '',
      notes: initialData?.notes || '',
    },
  });

  const [successMessage, setSuccessMessage] = useState<string | undefined>(
    undefined
  );
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('');
  const [providers, setProviders] = useState<CreateArticleProviderRequest[]>(
    []
  );
  const [components, setComponents] = useState<
    CreateArticleComponentRequest[]
  >([]);
  const [editingProvider, setEditingProvider] = useState<{
    index: number;
    data: CreateArticleProviderRequest;
  } | null>(null);
  const [showProviderForm, setShowProviderForm] = useState(false);

  const { createArticle, updateArticle, error } = useArticles();
  const { providers: allProviders } = useProviders(true);

  useEffect(() => {
    if (initialData) {
      setValue('description', initialData.description);
      setValue('unitPrice', initialData.unitPrice);
      setValue('marginPercentage', initialData.marginPercentage);
      setValue('notes', initialData.notes || '');
      
      if (initialData.familyId) {
        setSelectedFamilyId(initialData.familyId);
      }
      if (initialData.providers) {
        setProviders(
          initialData.providers.map(p => ({
            providerId: p.providerId,
            providerReference: p.providerReference,
            price: p.price,
            discount: p.discount,
            isDefault: p.isDefault,
            leadTimeDays: p.leadTimeDays,
          }))
        );
      }
      if (initialData.components) {
        setComponents(
          initialData.components.map(c => ({
            articleId: c.articleId,
            quantity: c.quantity,
            sortOrder: c.sortOrder,
          }))
        );
      }
    } else {
      setValue('marginPercentage', 0);
    }
  }, [initialData, setValue]);

  useEffect(() => {
    setValue('familyId', selectedFamilyId);
  }, [selectedFamilyId, setValue]);

  const onSubmit = async (data: CreateArticleRequest) => {
    try {
      // Calcular automáticamente el tipo: si tiene componentes es BOM, si no es Component
      const calculatedArticleType = components.length > 0 
        ? ArticleType.BillOfMaterials 
        : ArticleType.Component;

      const submitData: CreateArticleRequest = {
        description: data.description,
        articleType: calculatedArticleType,
        unitPrice: Number(data.unitPrice),
        marginPercentage: Number(data.marginPercentage),
        familyId: selectedFamilyId,
        notes: data.notes,
        providers: providers.length > 0 ? providers : undefined,
        components: components.length > 0 ? components : undefined,
      };

      console.log('Submitting data:', JSON.stringify(submitData, null, 2));

      if (isEdit) {
        const updated = await updateArticle({
          ...submitData,
          id: initialData!.id,
        } as UpdateArticleRequest);
        if (updated) {
          setSuccessMessage(t('article.updated.successfully'));
        }
      } else {
        const created = await createArticle(submitData);
        if (created) {
          setSuccessMessage(t('article.created.successfully'));
        }
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

  const tabs = [
    { id: 'basic' as TabType, label: t('basic.info'), icon: Package },
    { id: 'providers' as TabType, label: t('providers'), icon: Users },
    {
      id: 'components' as TabType,
      label: t('bill.of.materials'),
      icon: Layers,
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? t('article.update') : t('create.article')}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {isEdit
              ? t('article.update.description')
              : t('article.create.description')}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {activeTab === 'basic' && (
          <div className="space-y-5">
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

            <div className="grid grid-cols-3 gap-4">
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

            {initialData && (
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
        )}

        {activeTab === 'providers' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('providers')} ({providers.length})
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingProvider(null);
                  setShowProviderForm(true);
                }}
                className="px-3 py-2 gap-2 flex items-center text-sm bg-okron-main hover:bg-okron-mainHover text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                {t('add.provider')}
              </button>
            </div>

            {showProviderForm && (
              <ProviderForm
                providers={allProviders || []}
                editingProvider={editingProvider}
                onSave={(provider) => {
                  if (editingProvider !== null) {
                    const updated = [...providers];
                    updated[editingProvider.index] = provider;
                    setProviders(updated);
                  } else {
                    setProviders([...providers, provider]);
                  }
                  setShowProviderForm(false);
                  setEditingProvider(null);
                }}
                onCancel={() => {
                  setShowProviderForm(false);
                  setEditingProvider(null);
                }}
                t={t}
              />
            )}

            {providers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t('no.providers.added')}
              </div>
            ) : (
              <div className="space-y-2">
                {providers.map((provider, index) => {
                  const providerData = allProviders?.find(
                    p => p.id === provider.providerId
                  );
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {providerData?.name || provider.providerId}
                        </div>
                        <div className="text-sm text-gray-600 mt-1 space-y-1">
                          <div>
                            {t('reference')}: {provider.providerReference}
                          </div>
                          <div className="flex gap-4">
                            <span>
                              {t('price')}: {provider.price.toFixed(2)}€
                            </span>
                            <span>
                              {t('discount')}: {provider.discount}%
                            </span>
                            <span>
                              {t('lead.time')}: {provider.leadTimeDays}{' '}
                              {t('days')}
                            </span>
                            {provider.isDefault && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                                {t('default')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProvider({ index, data: provider });
                            setShowProviderForm(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProviders(providers.filter((_, i) => i !== index));
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('components')} ({components.length})
              </h3>
              <p className="text-sm text-gray-600">
                {t('components.info.message')}
              </p>
            </div>
            {components.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {t('no.components.added')}
              </div>
            )}
          </div>
        )}

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

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="cancel"
            onClick={onCancel}
            customStyles="px-4 py-2"
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="create"
            onClick={handleSubmit(onSubmit)}
            customStyles="px-4 py-2 gap-2 flex items-center"
            disabled={isSubmitting}
          >
            {isEdit ? t('article.update') : t('article.create')}
            {isSubmitting && <SvgSpinner className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}

interface ProviderFormProps {
  providers: Provider[];
  editingProvider: { index: number; data: CreateArticleProviderRequest } | null;
  onSave: (provider: CreateArticleProviderRequest) => void;
  onCancel: () => void;
  t: (key: string) => string;
}

function ProviderForm({
  providers,
  editingProvider,
  onSave,
  onCancel,
  t,
}: ProviderFormProps) {
  const [formData, setFormData] = useState<CreateArticleProviderRequest>(
    editingProvider?.data || {
      providerId: '',
      providerReference: '',
      price: 0,
      discount: 0,
      isDefault: false,
      leadTimeDays: 0,
    }
  );

  const providerElements: ElementList[] = providers.map(provider => ({
    id: provider.id,
    description: provider.name,
  }));

  const selectedProvider = providers.find(p => p.id === formData.providerId);

  const handleSubmit = () => {
    if (!formData.providerId || !formData.providerReference) {
      return;
    }
    onSave(formData);
  };

  return (
    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('provider')} <span className="text-red-500">*</span>
          </label>
          <AutocompleteSearchBar
            elements={providerElements}
            setCurrentId={(id) => setFormData({ ...formData, providerId: id })}
            placeholder={t('select.provider')}
          />
          {selectedProvider && (
            <div className="mt-2 text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
              {t('selected')}: <span className="font-medium">{selectedProvider.name}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('reference')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.providerReference}
            onChange={(e) => setFormData({ ...formData, providerReference: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('provider.reference.placeholder')}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('price')} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            required
            min="0"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('discount')} (%)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
            min="0"
            max="100"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('lead.time')} ({t('days')})
          </label>
          <input
            type="number"
            value={formData.leadTimeDays}
            onChange={(e) => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) || 0 })}
            min="0"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isDefault"
          checked={formData.isDefault}
          onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 cursor-pointer">
          {t('set.as.default.provider')}
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-3 py-2 text-sm bg-okron-main hover:bg-okron-mainHover text-white rounded-lg transition-colors"
        >
          {editingProvider ? t('update') : t('add')}
        </button>
      </div>
    </div>
  );
}
