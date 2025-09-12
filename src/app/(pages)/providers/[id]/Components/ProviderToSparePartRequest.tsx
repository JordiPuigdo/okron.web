import { useState } from 'react';
import { useProviders } from 'app/hooks/useProviders';
import { useTranslations } from 'app/hooks/useTranslations';
import { Provider, SparePartProviderRequest } from 'app/interfaces/Provider';
import SparePart from 'app/interfaces/SparePart';

interface ProviderToSparePartRequestProps {
  sparePart: SparePart;
  setSparePart: (sparePart: SparePart) => void;
}

const ProviderToSparePartRequest: React.FC<ProviderToSparePartRequestProps> = ({
  sparePart,
  setSparePart,
}) => {
  const { t } = useTranslations();
  const [selectedProvider, setSelectedProvider] = useState<
    Provider | undefined
  >(undefined);
  const [price, setPrice] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const { providers } = useProviders(true);
  const [searchText, setSearchText] = useState('');
  const [refProvider, setRefProvider] = useState('');
  const filteredProviders = providers?.filter(
    sp =>
      `${sp.name} - ${sp.phoneNumber}`
        .toLowerCase()
        .includes(searchText.toLowerCase()) &&
      !sparePart?.providers.some(x => x.providerId === sp.id)
  );

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedId = e.target.value;
    const selected = providers?.find(sp => sp.id === selectedId);
    if (selected) {
      setSelectedProvider(selected);

      setSearchText('');
    }
  }

  function handleAssignProviderToSparePart(request: SparePartProviderRequest) {
    const updatedSparePart = { ...sparePart };

    const isAlreadyAssigned = updatedSparePart.providers.some(
      x => x.providerId === request.providerId
    );

    if (isAlreadyAssigned) {
      updatedSparePart.providers = updatedSparePart.providers.filter(
        provider => provider.providerId !== request.providerId
      );
    } else {
      updatedSparePart.providers = [
        ...updatedSparePart.providers,
        {
          providerId: request.providerId,
          price: request.price,
          provider: providers?.find(x => x.id === request.providerId),
          isDefault: request.isDefault,
          discount: 0,
          refProvider: refProvider,
        },
      ];
    }
    setSparePart(updatedSparePart);
    setSelectedProvider(undefined);
    setPrice('');
    setSearchText('');
    setRefProvider('');
  }

  function handleAddProvider() {
    const finalPrice = price === '' ? '0' : price;
    handleAssignProviderToSparePart({
      providerId: selectedProvider!.id,
      price: finalPrice,
      isDefault: isDefault,
    });
  }
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleAddProvider();
    }
  }

  return (
    <div className="w-full relative">
      <input
        type="text"
        className="w-full p-2 border rounded-md mb-2"
        placeholder={t('providers.add.placeholder')}
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        onFocus={() => setSearchText('')}
      />

      {searchText && (
        <div className="absolute w-full mt-1 bg-white border rounded-md z-10 shadow-md">
          <select
            className="w-full p-2 border rounded-md"
            onChange={handleChange}
            value={selectedProvider?.id || ''}
            size={5}
          >
            <option value="">{t('providers.select.placeholder')}</option>
            {filteredProviders?.map(sp => (
              <option key={sp.id} value={sp.id}>
                {sp.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {selectedProvider && (
        <div className="bg-white rounded-lg border border-gray-200 mt-1">
          <div className="grid grid-cols-6 gap-2 px-3 py-2 bg-gray-50 text-sm text-gray-600 border-b">
            <span className="col-span-2">{t('providers.name')}</span>
            <span className="col-span-1">{t('providers.reference')}</span>
            <span className="col-span-1">{t('providers.price')}</span>
            <span className="col-span-1 text-center">{t('providers.default')}</span>
            <span className="col-span-1 text-right">{t('actions')}</span>
          </div>

          <div className="grid grid-cols-6 gap-2 px-3 py-2 items-center text-sm">
            <div className="col-span-2 truncate">
              <span className="font-medium">{selectedProvider.name}</span>
              <span className="text-gray-500 ml-1">
                - {selectedProvider.city}
              </span>
            </div>
            <div className="col-span-1 flex justify-center">
              <input
                type="text"
                placeholder={t('providers.reference.placeholder')}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                value={refProvider}
                onChange={e => setRefProvider(e.target.value)}
              />
            </div>
            <div className="col-span-1">
              <PriceInput
                price={price}
                setPrice={setPrice}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="col-span-1 flex justify-center">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
                checked={isDefault}
                onChange={() => setIsDefault(!isDefault)}
              />
            </div>

            <div className="col-span-1 flex justify-end gap-1">
              <button
                onClick={() => handleAddProvider()}
                className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
              >
                +
              </button>
              <button
                onClick={() => setSelectedProvider(undefined)}
                className="px-2 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderToSparePartRequest;

interface PriceInputProps {
  price: string;
  setPrice: (price: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}
const PriceInput: React.FC<PriceInputProps> = ({
  price,
  setPrice,
  onKeyDown,
  className,
}) => {
  const handleSetPrice = (value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setPrice(value);
    }
  };

  const { t } = useTranslations();

  return (
    <div className={className}>
      <input
        placeholder={t('providers.price.placeholder')}
        value={price}
        onChange={e => {
          const value = e.target.value;
          handleSetPrice(value);
        }}
        onKeyDown={e => {
          if (
            !/[0-9]|\./.test(e.key) && // Permite números y un solo punto
            e.key !== 'Backspace' && // Permite la tecla de borrar
            e.key !== 'Delete' && // Permite la tecla de suprimir
            e.key !== 'ArrowLeft' && // Permite flecha izquierda
            e.key !== 'ArrowRight' // Permite flecha derecha
          ) {
            e.preventDefault();
          }

          // Evita múltiples puntos decimales
          if (e.key === '.' && e.currentTarget.value.includes('.')) {
            e.preventDefault();
          }
          onKeyDown && onKeyDown(e);
        }}
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
};
