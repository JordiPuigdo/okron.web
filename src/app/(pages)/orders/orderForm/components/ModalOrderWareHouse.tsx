import { SvgClose } from 'app/icons/icons';
import { WareHouse } from 'app/interfaces/WareHouse';
import { useGlobalStore } from 'app/stores/globalStore';
import { Modal } from 'designSystem/Modals/Modal';

interface ModalOrderWareHouseProps {
  wareHouseIds: string[];
  onSelectedId: (id: string) => void;
  wareHouses: WareHouse[];
}

const ModalOrderWareHouse: React.FC<ModalOrderWareHouseProps> = ({
  wareHouseIds,
  onSelectedId,
  wareHouses,
}) => {
  const { setIsModalOpen } = useGlobalStore(state => state);

  return (
    <Modal
      isVisible={true}
      type="center"
      height="h-96"
      width="w-full"
      className="max-w-md mx-auto border border-black bg-white rounded-lg shadow-lg"
      avoidClosing={true}
    >
      <div className="relative">
        <div className="absolute top-2 right-2 hover:cursor-pointer">
          <SvgClose
            onClick={() => setIsModalOpen(false)}
            className="w-8 h-8 text-gray-600 hover:text-black transition"
          />
        </div>

        <div className="p-4 pt-10">
          {wareHouses
            .filter(x => wareHouseIds.includes(x.id))
            .map(x => (
              <div
                key={x.id}
                className="grid grid-cols-[auto,1fr] gap-4 p-3 border-b cursor-pointer hover:bg-gray-100 rounded-md"
                onClick={() => onSelectedId(x.id)}
              >
                <span className="font-medium text-gray-700">{x.code}</span>
                <span className="text-gray-500 truncate">{x.description}</span>
              </div>
            ))}
        </div>
      </div>
    </Modal>
  );
};

export default ModalOrderWareHouse;
