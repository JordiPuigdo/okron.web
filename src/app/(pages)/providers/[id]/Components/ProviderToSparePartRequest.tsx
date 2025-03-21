import { useState } from 'react';
import { useProviders } from 'app/hooks/useProviders';
import { Provider, SparePartProviderRequest } from 'app/interfaces/Provider';
import SparePart from 'app/interfaces/SparePart';
import { Button } from 'designSystem/Button/Buttons';

interface ProviderToSparePartRequestProps {
  sparePart: SparePart;
  setSparePart: (sparePart: SparePart) => void;
}

const ProviderToSparePartRequest: React.FC<ProviderToSparePartRequestProps> = ({
  sparePart,
  setSparePart,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<
    Provider | undefined
  >(undefined);
  const [price, setPrice] = useState('');
  const { providers } = useProviders(true);
  const [searchText, setSearchText] = useState('');
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
        },
      ];
    }
    setSparePart(updatedSparePart);
    setSelectedProvider(undefined);
    setPrice('');
    setSearchText('');
  }

  function handleAddProvider() {
    const finalPrice = price === '' ? '0' : price;
    handleAssignProviderToSparePart({
      providerId: selectedProvider!.id,
      price: finalPrice,
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
        placeholder="Afegir proveïdor..."
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
            <option value="">Selecciona un proveïdor</option>
            {filteredProviders?.map(sp => (
              <option key={sp.id} value={sp.id}>
                {sp.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {selectedProvider && (
        <div
          className={`flex flex-row gap-2 border p-2 items-center w-full ${
            selectedProvider && 'border-red-500'
          }`}
        >
          <div className="w-full">
            {selectedProvider?.name} - {selectedProvider?.city}
          </div>
          <PriceInput
            price={price}
            setPrice={setPrice}
            onKeyDown={handleKeyDown}
          />
          <div className="flex w-[12%] gap-2">
            <Button
              type="create"
              customStyles="gap-2 flex items-center justify-center w-full p-2"
              onClick={() => handleAddProvider()}
            >
              +
            </Button>

            <Button
              type="cancel"
              customStyles="flex items-center justify-center w-full p-2"
              onClick={() => setSelectedProvider(undefined)}
            >
              -
            </Button>
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
}
const PriceInput: React.FC<PriceInputProps> = ({
  price,
  setPrice,
  onKeyDown,
}) => {
  const handleSetPrice = (value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setPrice(value);
    }
  };

  return (
    <div className="w-[25%]">
      <input
        placeholder="Preu"
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
