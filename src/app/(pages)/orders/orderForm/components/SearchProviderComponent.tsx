import { useState } from 'react';
import { useProviders } from 'app/hooks/useProviders';
import { Provider } from 'app/interfaces/Provider';
import { Button } from 'designSystem/Button/Buttons';

interface SearchProviderComponentProps {
  onSelectedProvider(provider: Provider | undefined): void;
}
export default function SearchProviderComponent({
  onSelectedProvider,
}: SearchProviderComponentProps) {
  const { providers } = useProviders(true);
  const [searchProvider, setSearchProvider] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<
    Provider | undefined
  >(undefined);
  const filteredProviders = providers?.filter(p =>
    `${p.name}`.toLowerCase().includes(searchProvider.toLowerCase())
  );

  const handleChangeProvider = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selected = providers?.find(sp => sp.id === selectedId);
    if (selected) {
      onSelectedProvider(selected);
      setSelectedProvider(selected);
      setSearchProvider('');
    }
  };

  return (
    <>
      <input
        type="text"
        className="w-full p-2 border rounded-md mb-2"
        placeholder="Buscar proveïdor..."
        value={searchProvider}
        onChange={e => {
          setSearchProvider(e.target.value);
        }}
        onFocus={() => setSearchProvider('')}
        disabled={selectedProvider != null}
      />
      {searchProvider && (
        <div className="absolute w-full mt-1 bg-white border rounded-md z-10 shadow-md">
          <select
            className="w-full p-2 border rounded-md"
            onChange={handleChangeProvider}
            value={selectedProvider?.id || ''}
            size={5}
          >
            <option value="">Selecciona un proveeïdor</option>
            {filteredProviders?.map(sp => (
              <option key={sp.id} value={sp.id}>
                {sp.name} - {sp.nie}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex gap-4 items-center">
        {selectedProvider?.name && (
          <>
            <p className="text-sm text-gray-500">
              {selectedProvider.name} - {selectedProvider.nie}
            </p>
            <div>
              <Button
                type="delete"
                onClick={() => {
                  setSelectedProvider(undefined);
                  onSelectedProvider(undefined);
                }}
              >
                -
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
