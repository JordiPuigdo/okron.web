import { useMemo, useState } from 'react';
import { EditableCell } from 'app/(pages)/machines/downtimes/components/EditingCell';
import { useTranslations } from 'app/hooks/useTranslations';
import SparePart from 'app/interfaces/SparePart';

interface SparePartProvidersSelectedProps {
  sparePart: SparePart;
  handleRemoveProvider: (providerId: string) => void;
  handleUpdatePrice: (providerId: string, price: string) => void;
  handleUpdateIsDefault: (providerId: string) => void;
  handleUpdateDiscount: (providerId: string, discount: string) => void;
  handleUpdateRefProvider: (providerId: string, refProvider: string) => void;
}

export default function SparePartProvidersSelected({
  sparePart,
  handleRemoveProvider,
  handleUpdatePrice,
  handleUpdateIsDefault,
  handleUpdateDiscount,
  handleUpdateRefProvider,
}: SparePartProvidersSelectedProps) {
  const { t } = useTranslations();
    if (!sparePart) return null;
  const [searchText, setSearchText] = useState('');

  const filteredProviders = useMemo(() => {
    const normalizedSearch = searchText.toLowerCase().trim();

    if (!normalizedSearch) return sparePart.providers;

    return sparePart.providers.filter(x => {
      const name = x.provider?.name?.toLowerCase() || '';
      const ref = x.refProvider?.toLowerCase() || '';
      return name.includes(normalizedSearch) || ref.includes(normalizedSearch);
    });
  }, [searchText, sparePart?.providers]);

  function handleCheckIsDefault(providerId: string) {
    const provider = sparePart.providers.find(
      x => x.isDefault && x.providerId !== providerId
    );
    if (provider) {
      alert(t('providers.only.one.default'));
      return;
    } else {
      handleUpdateIsDefault(providerId);
    }
  }

  return (
    <div className="flex flex-col flex-grow ">
      <div className="mb-2">
        <input
          type="text"
          placeholder="Cerca proveïdor o referència..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-2 justify-between items-center bg-gray-100 p-3 rounded-lg font-semibold text-gray-700 text-sm">
     <div className="flex-[2]">{t('providers.name')}</div>
        <div className="flex-[2]">{t('providers.reference')}</div>
        <div className="flex-[1]">{t('providers.price')}</div>
        <div className="flex-[1]">{t('providers.discount.percentage')}</div>
        <div className="flex-[1]">{t('providers.default')}</div>
        <div className="flex-[1]">{t('actions')}</div>
      </div>
      <div className="overflow-y-auto max-h-[300px] divide-y divide-gray-200 text-sm">
        {filteredProviders.length > 0 ? (
          filteredProviders.map(x => (
            <div
              key={x.providerId}
              className="flex gap-2 justify-between items-center p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-[2] text-gray-600 overflow-hidden whitespace-nowrap truncate">
                {x.provider?.name || '—'}
              </div>

              <div className="flex-[2] text-gray-600 overflow-hidden whitespace-nowrap truncate">
                <EditableCell
                  value={
                    x.refProvider && x.refProvider.length > 0
                      ? x.refProvider
                      : '-'
                  }
                  onUpdate={newValue =>
                    handleUpdateRefProvider(x.providerId, newValue)
                  }
                />
              </div>

              <div className="flex-[1] text-gray-600">
                <EditableCell
                  value={x.price}
                  onUpdate={newValue =>
                    handleUpdatePrice(x.providerId, newValue)
                  }
                />
              </div>

              <div className="flex-[1] text-gray-600">
                <EditableCell
                  value={x.discount.toString()}
                  onUpdate={newValue =>
                    handleUpdateDiscount(x.providerId, newValue)
                  }
                />
              </div>

              <div className="flex-[1] text-center">
                <input
                  type="checkbox"
                  checked={x.isDefault}
                  onChange={() => handleCheckIsDefault(x.providerId)}
                />
              </div>

              <div className="flex-[1] text-center">
                <button
                  onClick={() => handleRemoveProvider(x.providerId)}
                  className="px-2 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">
            No s'han trobat proveïdors.
          </div>
        )}
      </div>
    </div>
  );
}
