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
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          className="w-full p-2 pl-8 border rounded-md"
          placeholder="Buscar proveïdor..."
          value={searchProvider}
          onChange={e => setSearchProvider(e.target.value)}
          onFocus={() => setSearchProvider('')}
          onClick={e => {
            if (selectedProvider?.id !== e.currentTarget.value) {
              setSearchProvider(e.currentTarget.value);
            }
          }}
        />

        <svg
          className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {searchProvider && (
        <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-10 max-h-60 overflow-auto">
          <div className="py-1">
            {filteredProviders?.map(provider => (
              <div
                key={provider.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                onClick={() => {
                  onSelectedProvider(provider);
                  setSelectedProvider(provider);
                  setSearchProvider('');
                }}
              >
                <div>
                  <div className="font-medium">{provider.name}</div>
                  <div className="text-sm text-gray-500">{provider.nie}</div>
                </div>
              </div>
            ))}
            {filteredProviders?.length === 0 && (
              <div className="px-4 py-2 text-gray-500 text-center">
                No s'han trobat resultats
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Provider Display */}
      {/*selectedProvider && (
        <div className="mt-2 flex items-center justify-between p-2 bg-gray-50 rounded-md">
          <div>
            <span className="font-medium">{selectedProvider.name}</span>
            <span className="text-sm text-gray-500 ml-2">
              - {selectedProvider.nie}
            </span>
          </div>
          <Button
            type="delete"
            onClick={() => {
              setSelectedProvider(undefined);
              onSelectedProvider(undefined);
            }}
            className="h-8 w-8 flex items-center justify-center"
          >
            ×
          </Button>
        </div>
      )} */}
    </div>
  );
}
