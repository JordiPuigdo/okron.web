import { useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgClose } from 'app/icons/icons';
import { OrderItemRequest } from 'app/interfaces/Order';
import { useGlobalStore } from 'app/stores/globalStore';
import { Modal } from 'designSystem/Modals/Modal';

interface ModalUnitsProps {
  item: OrderItemRequest;
  onAddUnits(units: number, sparePartId: string): void;
}

const ModalUnits: React.FC<ModalUnitsProps> = ({ item, onAddUnits }) => {
  const { t } = useTranslations();
  const { setIsModalOpen } = useGlobalStore(state => state);
  const [units, setUnits] = useState<number>(0);
  const [error, setError] = useState<string>('');

  function checkUnits(unitsRequested: number) {
    if (unitsRequested > item.quantity) {
      setError(
        t('units.cannot.exceed.available')
      );
    } else {
      setError('');
      if (unitsRequested > 0) {
        setUnits(unitsRequested);
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = value === '' ? 0 : parseInt(value);
      setUnits(numValue);
      checkUnits(numValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      !/^\d$/.test(e.key) &&
      e.key !== 'Backspace' &&
      e.key !== 'Delete' &&
      e.key !== 'Enter'
    ) {
      e.preventDefault();
    }

    if (e.key === 'Enter') {
      checkUnits(units);
      if (!error && units > 0) onAddUnits(units, item.sparePart.id);
    }
  };

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
              <span className="font-medium text-gray-700">{t('code')}:</span>
              <span className="text-gray-500 truncate">
                {item.sparePart.code}
              </span>
              <div className="flex flex-row gap-2">
                <span className="font-medium text-gray-700">{t('description')}:</span>
                <span className="text-gray-500 truncate">
                  {item.sparePart.description}
                </span>
              </div>
            </div>
            <div>
              {t('units')}:{' '}
              <input
                type="text"
                value={units || ''}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="border border-gray-300 rounded-md p-2 w-20 text-center"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <button
              className={`bg-green-500 text-white p-2 rounded-md  ${
                error !== '' ? 'opacity-50 ' : 'hover:bg-green-600'
              }`}
              onClick={() => onAddUnits(units, item.sparePart.id)}
              disabled={error !== ''}
            >
              {t('add')}
            </button>
          </div>
          {error && <div className="text-red-500">{error}</div>}
        </div>
      </div>
    </Modal>
  );
};

export default ModalUnits;
