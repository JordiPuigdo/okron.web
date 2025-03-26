import { EditableCell } from 'app/(pages)/machines/downtimes/components/EditingCell';
import SparePart from 'app/interfaces/SparePart';

interface SparePartProvidersSelectedProps {
  sparePart: SparePart;
  handleRemoveProvider: (providerId: string) => void;
  handleUpdatePrice: (providerId: string, price: string) => void;
  handleUpdateIsDefault: (providerId: string) => void;
}

export default function SparePartProvidersSelected({
  sparePart,
  handleRemoveProvider,
  handleUpdatePrice,
  handleUpdateIsDefault,
}: SparePartProvidersSelectedProps) {
  function handleCheckIsDefault(providerId: string) {
    const provider = sparePart.providers.find(
      x => x.isDefault && x.providerId !== providerId
    );
    if (provider) {
      alert('Només pots tenir un proveïdor per habitual');
      return;
    } else {
      handleUpdateIsDefault(providerId);
    }
  }

  return (
    <div className="flex flex-col flex-grow ">
      <div className="flex flex-row gap-2 justify-between items-center bg-gray-100 p-3 rounded-lg">
        <div className="w-2/5 font-semibold text-gray-700">Nom</div>
        <div className="w-2/5 font-semibold text-gray-700">Ciutat</div>
        <div className="w-1/5 font-semibold text-gray-700">Preu</div>
        <div className="w-1/5 font-semibold text-gray-700">Habitual</div>
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
          <div className="w-1/12 text-gray-600">
            <input
              type="checkbox"
              checked={x.isDefault}
              onChange={() => handleCheckIsDefault(x.providerId)}
            />
          </div>
          <button
            onClick={() => handleRemoveProvider(x.providerId)}
            className="px-2 py-1 bg-gray-400 hover:bg-gray-500 text-white rounded text-sm"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
