import { useState } from 'react';
import { SvgClose } from 'app/icons/icons';
import { OrderItemRequest } from 'app/interfaces/Order';
import { useGlobalStore } from 'app/stores/globalStore';
import { Modal } from 'designSystem/Modals/Modal';

interface ModalUnitsProps {
  item: OrderItemRequest;
  onAddUnits(units: number, sparePartId: string): void;
}

const ModalUnits: React.FC<ModalUnitsProps> = ({ item, onAddUnits }) => {
  const { setIsModalOpen } = useGlobalStore(state => state);
  const [units, setUnits] = useState<number>(0);
  const [error, setError] = useState<string>('');
  function checkUnits(unitsRequested: number) {
    if (unitsRequested > item.quantity) {
      setError(
        "El número de unitats no pot ser major al número d'unitats disponibles"
      );
    } else {
      setError('');
      if (unitsRequested > 0) {
        setUnits(unitsRequested);
      }
    }
  }

  /* function addUnits(unitsRequested: number) {
    checkUnits(unitsRequested);
    if (error) return;
    //onAddUnits(units);
    //setIsModalOpen(false);
  }*/

  return (
    <Modal
      isVisible={true}
      type="center"
      height="h-46"
      width="w-46"
      className="max-w-md mx-auto border border-black bg-white rounded-lg shadow-lg"
      avoidClosing={true}
    >
      <div className="">
        <div className="absolute top-2 right-2 hover:cursor-pointer">
          <SvgClose
            onClick={() => setIsModalOpen(false)}
            className="w-8 h-8 text-gray-600 hover:text-black transition"
          />
        </div>

        <div className="flex flex-col gap-2 p-4 pt-10 items-center">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <span className="font-medium text-gray-700">Codi:</span>
              <span className="text-gray-500 truncate">
                {item.sparePart.code}
              </span>
              <div className="flex flex-row gap-2">
                <span className="font-medium text-gray-700">Descripció:</span>
                <span className="text-gray-500 truncate">
                  {item.sparePart.description}
                </span>
              </div>
            </div>
            <div>
              Unitats:{' '}
              <input
                type="number"
                onChange={e => checkUnits(Number(e.target.value))}
                value={units}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    onAddUnits(units, item.sparePart.id);
                  }
                }}
                className="border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>
          <div>
            <button
              className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
              onClick={() => onAddUnits(units, item.sparePart.id)}
            >
              Afegir
            </button>
          </div>
          {error && <div className="text-red-500">{error}</div>}
        </div>
      </div>
    </Modal>
  );
};

export default ModalUnits;
