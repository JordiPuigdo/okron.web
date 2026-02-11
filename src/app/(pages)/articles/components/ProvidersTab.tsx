'use client';

import { useState } from 'react';
import { CreateArticleProviderRequest } from 'app/interfaces/Article';
import { Provider } from 'app/interfaces/Provider';
import AutocompleteSearchBar from 'components/selector/AutocompleteSearchBar';
import { ElementList } from 'components/selector/ElementList';
import { Edit2, Plus, Trash2 } from 'lucide-react';

interface ProvidersTabProps {
  providers: CreateArticleProviderRequest[];
  setProviders: (providers: CreateArticleProviderRequest[]) => void;
  allProviders: Provider[] | undefined;
  t: (key: string) => string;
}

export function ProvidersTab({
  providers,
  setProviders,
  allProviders,
  t,
}: ProvidersTabProps) {
  const [editingProvider, setEditingProvider] = useState<{
    index: number;
    data: CreateArticleProviderRequest;
  } | null>(null);
  const [showProviderForm, setShowProviderForm] = useState(false);

  return (
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
          onSave={provider => {
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
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-2">📦</div>
          <p className="font-medium">{t('no.providers.added')}</p>
          <p className="text-sm mt-1">{t('add.provider.to.start')}</p>
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
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {providerData?.name || provider.providerId}
                    </span>
                    {provider.isDefault && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                        {t('default')}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                    <div>
                      <span className="font-medium">{t('reference')}:</span>{' '}
                      {provider.providerReference}
                    </div>
                    <div>
                      <span className="font-medium">{t('price')}:</span>{' '}
                      {provider.price.toFixed(2)}€
                    </div>
                    <div>
                      <span className="font-medium">{t('discount')}:</span>{' '}
                      {provider.discount}%
                    </div>
                    <div>
                      <span className="font-medium">{t('lead.time')}:</span>{' '}
                      {provider.leadTimeDays} {t('days')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProvider({ index, data: provider });
                      setShowProviderForm(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProviders(providers.filter((_, i) => i !== index));
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
    <div className="space-y-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">
          {editingProvider ? t('edit.provider') : t('add.new.provider')}
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('provider')} <span className="text-red-500">*</span>
          </label>
          <AutocompleteSearchBar
            elements={providerElements}
            setCurrentId={id => setFormData({ ...formData, providerId: id })}
            placeholder={t('select.provider')}
          />
          {selectedProvider && (
            <div className="mt-2 text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
              {t('selected')}:{' '}
              <span className="font-medium">{selectedProvider.name}</span>
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
            onChange={e =>
              setFormData({ ...formData, providerReference: e.target.value })
            }
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
            onChange={e =>
              setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
            }
            required
            min="0"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
            onChange={e =>
              setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })
            }
            min="0"
            max="100"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
            onChange={e =>
              setFormData({
                ...formData,
                leadTimeDays: parseInt(e.target.value) || 0,
              })
            }
            min="0"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
        <input
          type="checkbox"
          id="isDefault"
          checked={formData.isDefault}
          onChange={e =>
            setFormData({ ...formData, isDefault: e.target.checked })
          }
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <label
          htmlFor="isDefault"
          className="text-sm font-medium text-gray-700 cursor-pointer"
        >
          {t('set.as.default.provider')}
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-blue-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors font-medium"
        >
          {t('common.cancel')}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!formData.providerId || !formData.providerReference}
          className="px-4 py-2 text-sm bg-okron-main hover:bg-okron-mainHover text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {editingProvider ? t('update') : t('add')}
        </button>
      </div>
    </div>
  );
}
