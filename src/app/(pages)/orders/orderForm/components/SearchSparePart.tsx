import { useEffect, useState } from 'react';
import { OrderItemRequest } from 'app/interfaces/Order';
import { Provider } from 'app/interfaces/Provider';
import SparePart from 'app/interfaces/SparePart';
import SparePartService from 'app/services/sparePartService';
import { Button } from 'designSystem/Button/Buttons';

export interface SearchSparePartOrderPurchaseProps {
  handleAddOrderItem(item: OrderItemRequest): void;
  onSelectedSparePart(sparePart: SparePart | undefined): void;
  selectedProvider: Provider | undefined;
}

export default function SearchSparePartOrderPurchase({
  handleAddOrderItem,
  onSelectedSparePart,
  selectedProvider,
}: SearchSparePartOrderPurchaseProps) {
  const [quantity, setQuantity] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [selectedSparePart, setSelectedSparePart] = useState<
    SparePart | undefined
  >(undefined);
  const [spareParts, setSPareParts] = useState<SparePart[]>([]);

  function addItem() {
    if (selectedSparePart) {
      setQuantity(1);
      setUnitPrice('');
      setSearchText('');
      handleAddOrderItem({
        quantity: quantity,
        sparePartId: selectedSparePart?.id,
        unitPrice: unitPrice,
        sparePart: selectedSparePart,
      });
      setSelectedSparePart(undefined);
    }
  }
  const sparePartService = new SparePartService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );

  const fetchSparePartsByProvider = async (
    providerId: string
  ): Promise<SparePart[]> => {
    try {
      const response = await sparePartService.getSparePartsByProviderId(
        providerId
      );
      setSPareParts(response);
      return response;
    } catch (error) {
      console.error('Error fetching spareParts by providerId:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (selectedProvider) {
      fetchSparePartsByProvider(selectedProvider.id);
    } else {
      setSelectedSparePart(undefined);
    }
  }, [selectedProvider]);

  const filteredSpareParts = spareParts?.filter(
    sp =>
      `${sp.code} - ${sp.description}`
        .toLowerCase()
        .includes(searchText.toLowerCase()) &&
      sp.providers &&
      sp.providers.length > 0 &&
      sp.providers.some(x => x.providerId == selectedProvider?.id)
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selected = spareParts?.find(sp => sp.id === selectedId);
    if (selected) {
      onSelectedSparePart(selected);
      setSelectedSparePart(selected);
      setUnitPrice(
        selected.providers.filter(x => x.providerId == selectedProvider?.id)[0]
          .price
      );
      setSearchText('');
    }
  };
  /*  const handleAddItem = () => {
    if (!selectedSparePart) return;
    const sparePart = spareParts!.find(sp => sp.id === selectedSparePart.id);
    if (!sparePart) return;
    if (sparePart.wareHouseId.length > 1) return;
  };*/

  return (
    <div>
      <div className="border-t pt-4">
        <div className="grid grid-cols-[6fr_1fr_1fr] gap-2 text-left pb-2">
          <h3 className="text-lg font-semibold">Afegir Recanvis</h3>

          <h3 className="text-lg font-semibold">Quantitat</h3>
          <h3 className="text-lg font-semibold">Acció</h3>
        </div>

        <div className="grid grid-cols-[6fr_1fr_1fr] gap-2">
          <div className="flex w-full">
            <div className="w-full relative">
              <input
                type="text"
                className="w-full p-2 border rounded-md mb-2"
                placeholder="Buscar recanvis..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onFocus={() => setSearchText('')}
                disabled={!selectedProvider}
              />

              {searchText && (
                <div className="absolute w-full mt-1 bg-white border rounded-md z-10 shadow-md">
                  <select
                    className="w-full p-2 border rounded-md"
                    onChange={handleChange}
                    value={selectedSparePart?.id || ''}
                    size={5}
                  >
                    <option value="">Selecciona un recanvi</option>
                    {filteredSpareParts?.map(sp => (
                      <option key={sp.id} value={sp.id}>
                        {sp.code} - {sp.description}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <input
            type="number"
            className="w-full p-2 border rounded-md"
            min="1"
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            disabled={!selectedProvider}
          />

          <button
            onClick={addItem}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full"
            disabled={!selectedProvider}
          >
            Afegir
          </button>
        </div>
        {selectedSparePart && (
          <div className="flex gap-4 items-center">
            <div>
              {selectedSparePart?.code} - {selectedSparePart?.description}
            </div>
            <Button
              type="delete"
              onClick={() => setSelectedSparePart(undefined)}
            >
              -
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
