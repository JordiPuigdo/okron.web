import { EditableCell } from 'app/(pages)/machines/downtimes/components/EditingCell';
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
      <div className="flex gap-2 justify-between items-center bg-gray-100 p-3 rounded-lg font-semibold text-gray-700 text-sm">
        <div className="flex-[2]">Nom</div>
        <div className="flex-[2]">Referència</div>
        <div className="flex-[1]">Preu</div>
        <div className="flex-[1]">% Dte.</div>
        <div className="flex-[1]">Habitual</div>
        <div className="flex-[1]">Accions</div>
      </div>
      <div className="overflow-y-auto max-h-[300px] divide-y divide-gray-200 text-sm">
        {sparePart?.providers.map(x => (
          <div
            key={x.providerId}
            className="flex gap-2 justify-between items-center p-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex-[2] text-gray-600 overflow-hidden whitespace-nowrap truncate">
              {x.provider?.name}
            </div>

            <div className="flex-[2] text-gray-600 overflow-hidden whitespace-nowrap truncate">
              <EditableCell
                value={x.refProvider}
                onUpdate={newValue =>
                  handleUpdateRefProvider(x.providerId, newValue)
                }
              />
            </div>

            <div className="flex-[1] text-gray-600">
              <EditableCell
                value={x.price}
                onUpdate={newValue => handleUpdatePrice(x.providerId, newValue)}
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
        ))}
      </div>
    </div>
  );
}
