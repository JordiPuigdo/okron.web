import { EditableCell } from 'app/(pages)/machines/downtimes/components/EditingCell';
import SparePart from 'app/interfaces/SparePart';
import { Button } from 'designSystem/Button/Buttons';

interface SparePartProvidersSelectedProps {
  sparePart: SparePart;
  handleRemoveProvider: (providerId: string) => void;
  handleUpdatePrice: (providerId: string, price: string) => void;
}

export default function SparePartProvidersSelected({
  sparePart,
  handleRemoveProvider,
  handleUpdatePrice,
}: SparePartProvidersSelectedProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-row gap-2 justify-between items-center bg-gray-100 p-3 rounded-lg">
        <div className="w-2/5 font-semibold text-gray-700">Nom</div>
        <div className="w-2/5 font-semibold text-gray-700">Ciutat</div>
        <div className="w-1/5 font-semibold text-gray-700">Preu</div>
        <div className="w-1/7 font-semibold text-gray-700">Accions</div>
      </div>

      {sparePart?.providers.map(x => (
        <div
          key={x.providerId}
          className="flex flex-row gap-2 justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="w-1/4 text-gray-600">{x.provider?.name}</div>
          <div className="w-1/4 text-gray-600">{x.provider?.city}</div>
          <div className="w-1/12 text-gray-600">
            <EditableCell
              value={x.price}
              onUpdate={newValue => handleUpdatePrice(x.providerId, newValue)}
            />
          </div>
          <Button
            type="none"
            onClick={() => handleRemoveProvider(x.providerId)}
            customStyles="w-1/6 bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
          >
            -
          </Button>
        </div>
      ))}
    </div>
  );
}
