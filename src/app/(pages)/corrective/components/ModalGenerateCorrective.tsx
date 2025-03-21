import { SvgClose } from 'app/icons/icons';
import { StateWorkOrder } from 'app/interfaces/workOrder';
import { useGlobalStore } from 'app/stores/globalStore';
import { Modal } from 'designSystem/Modals/Modal';

import GenerateCorrective from './GenerateCorrective';

interface ModalGenerateCorrectiveProps {
  assetId: string;
  description: string;
  stateWorkOrder: StateWorkOrder;
  operatorIds?: string[];
  originalWorkOrderId?: string;
  originalWorkOrderCode?: string;
}

const ModalGenerateCorrective: React.FC<ModalGenerateCorrectiveProps> = ({
  assetId,
  description,
  stateWorkOrder,
  operatorIds,
  originalWorkOrderId,
  originalWorkOrderCode,
}) => {
  const { setIsModalOpen } = useGlobalStore(state => state);
  return (
    <Modal
      isVisible={true}
      type="center"
      height="h-auto"
      width="w-full"
      className="max-w-lg mx-auto border-4 border-blue-950"
      avoidClosing={true}
    >
      <div>
        <div className="relative bg-white">
          <div className="absolute p-2 top-0 right-0 justify-end hover:cursor-pointer">
            <SvgClose
              onClick={() => {
                setIsModalOpen(false);
              }}
            />
          </div>
        </div>
      </div>
      <GenerateCorrective
        assetId={assetId}
        description={description}
        stateWorkOrder={stateWorkOrder}
        operatorIds={operatorIds}
        showReasons={false}
        originalWorkOrderId={originalWorkOrderId}
        originalWorkOrderCode={originalWorkOrderCode}
      />
    </Modal>
  );
};

export default ModalGenerateCorrective;
