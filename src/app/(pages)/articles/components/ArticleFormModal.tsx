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
import { Button } from 'designSystem/Button/Buttons';
import { Modal2 } from 'designSystem/Modals/Modal';
import { Layers, Package, Users } from 'lucide-react';

import { ArticleTypeIndicator } from './ArticleTypeIndicator';
import { BasicInfoForm } from './BasicInfoForm';
import { ComponentsTab } from './ComponentsTab';
import { ProvidersTab } from './ProvidersTab';

interface ArticleFormModalProps {
  isVisible: boolean;
  initialData?: Article;
  onSuccess: (article?: Article) => void;
  onCancel: () => void;
}

type TabType = 'basic' | 'providers' | 'components';

export function ArticleFormModal({
  isVisible,
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
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateArticleRequest>({
    defaultValues: {
      description: '',
      articleType: ArticleType.Component,
      unitPrice: 0,
      marginPercentage: 0,
      familyId: '',
      notes: '',
    },
  });

  const [successMessage, setSuccessMessage] = useState<string | undefined>(
    undefined
  );
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('');
  const [selectedArticleType, setSelectedArticleType] = useState<ArticleType>(
    initialData?.articleType ?? ArticleType.Component
  );
  const [providers, setProviders] = useState<CreateArticleProviderRequest[]>(
    []
  );
  const [components, setComponents] = useState<
    CreateArticleComponentRequest[]
  >([]);

  const { createArticle, updateArticle, articles } = useArticles();
  const {
    providers: allProviders,
    createProvider,
    fetchProviders,
  } = useProviders(true);
  const [displayError, setDisplayError] = useState<string | undefined>(
    undefined
  );

  // Reset form when modal opens
  useEffect(() => {
    if (!isVisible) return;

      setSuccessMessage(undefined);
      setDisplayError(undefined);

      if (initialData) {
        reset({
          description: initialData.description,
          articleType: Number(initialData.articleType) as ArticleType,
          unitPrice: initialData.unitPrice,
          marginPercentage: initialData.marginPercentage,
          familyId: initialData.familyId,
          notes: initialData.notes || '',
        });
        setSelectedFamilyId(initialData.familyId || '');
        setSelectedArticleType(Number(initialData.articleType) as ArticleType);
        setProviders(
          initialData.providers?.map(p => ({
            providerId: p.providerId,
            providerReference: p.providerReference,
            price: p.price,
            discount: p.discount,
            isDefault: p.isDefault,
            leadTimeDays: p.leadTimeDays,
          })) || []
        );
        setComponents(
          initialData.components?.map(c => ({
            articleId: c.articleId,
            quantity: c.quantity,
            sortOrder: c.sortOrder,
          })) || []
        );
      } else {
        // Limpiar todo para nuevo artículo
        reset({
          description: '',
          articleType: ArticleType.Component,
          unitPrice: 0,
          marginPercentage: 0,
          familyId: '',
          notes: '',
        });
        setSelectedFamilyId('');
        setSelectedArticleType(ArticleType.Component);
        setProviders([]);
        setComponents([]);
      }
      setActiveTab('basic');
    
  }, [isVisible, initialData, reset]);

  useEffect(() => {
    setValue('familyId', selectedFamilyId);
  }, [selectedFamilyId, setValue]);

  useEffect(() => {
    setValue('articleType', selectedArticleType);
  }, [selectedArticleType, setValue]);

  const onSubmit = async (data: CreateArticleRequest) => {
    try {
      const submitData: CreateArticleRequest = {
        description: data.description,
        articleType: Number(selectedArticleType) as ArticleType,
        unitPrice: Number(data.unitPrice),
        marginPercentage: Number(data.marginPercentage),
        familyId: selectedFamilyId,
        notes: data.notes,
        providers: providers.length > 0 ? providers : undefined,
        components: components.length > 0 ? components : undefined,
        active: data.active,
      };

      let resultArticle: Article | undefined;

      if (isEdit) {
        const updated = await updateArticle({
          ...submitData,
          id: initialData!.id,
        } as UpdateArticleRequest);
        if (updated) {
          setSuccessMessage(t('article.updated.successfully'));
          resultArticle = updated;
        }
      } else {
        const created = await createArticle(submitData);
        if (created) {
          setSuccessMessage(t('article.created.successfully'));
          resultArticle = created;
        }
      }

      if (resultArticle) {
        setTimeout(() => {
          onSuccess(resultArticle);
        }, 2000);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setDisplayError(
        err instanceof Error ? err.message : 'Error submitting form'
      );
    }
  };

  const tabs = [
    { id: 'basic' as TabType, label: t('basic.info'), icon: Package },
    { id: 'providers' as TabType, label: t('providers'), icon: Users },
    ...(selectedArticleType === ArticleType.Component
      ? [{ id: 'components' as TabType, label: t('bill.of.materials'), icon: Layers }]
      : []),
  ];

  return (
    <Modal2
      isVisible={isVisible}
      setIsVisible={onCancel}
      type="center"
      width="w-full max-w-4xl"
      height="h-[85vh]"
      className="overflow-hidden flex flex-col shadow-2xl"
      closeOnEsc
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 p-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {isEdit ? t('article.update') : t('create.article')}
              </h2>
              <p className="text-sm text-gray-600">
                {isEdit
                  ? t('article.update.description')
                  : t('article.create.description')}
              </p>
            </div>
            <div className="ml-4">
              <ArticleTypeIndicator
                type={selectedArticleType}
                t={t}
                size="lg"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 flex gap-1 px-6 border-b bg-gray-50">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {activeTab === 'basic' && (
              <BasicInfoForm
                register={register}
                errors={errors}
                selectedFamilyId={selectedFamilyId}
                setSelectedFamilyId={setSelectedFamilyId}
                selectedArticleType={selectedArticleType}
                setSelectedArticleType={setSelectedArticleType}
                setValue={setValue}
                isEdit={isEdit}
                initialData={initialData}
                t={t}
              />
            )}

            {activeTab === 'providers' && (
              <ProvidersTab
                providers={providers}
                setProviders={setProviders}
                allProviders={allProviders}
                onCreateProvider={createProvider}
                onRefreshProviders={fetchProviders}
                t={t}
              />
            )}

            {activeTab === 'components' && (
              <ComponentsTab
                components={components}
                setComponents={setComponents}
                allArticles={articles}
                currentArticleId={initialData?.id}
                t={t}
              />
            )}

          </form>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-between items-center gap-3 px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center gap-3 text-sm">
            {successMessage && (
              <span className="text-green-600 font-medium">{successMessage}</span>
            )}
            {displayError && (
              <span className="text-red-600 font-medium">{displayError}</span>
            )}
            {!successMessage && !displayError && (
              selectedArticleType === ArticleType.BillOfMaterials ? (
                <span className="flex items-center gap-2 text-gray-600">
                  <Layers className="h-4 w-4 text-purple-600" />
                  {t('this.will.be.a.bom')}
                </span>
              ) : (
                <span className="flex items-center gap-2 text-gray-600">
                  <Package className="h-4 w-4 text-blue-600" />
                  {t('this.will.be.a.component')}
                </span>
              )
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="cancel"
              onClick={onCancel}
              customStyles="px-5 py-2.5"
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="create"
              onClick={handleSubmit(onSubmit)}
              customStyles="px-5 py-2.5 gap-2 flex items-center"
              disabled={isSubmitting}
            >
              {isEdit ? t('article.update') : t('article.create')}
              {isSubmitting && <SvgSpinner className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </Modal2>
  );
}
