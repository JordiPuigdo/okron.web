import { useMemo, useState } from 'react';
import { useWareHouses } from 'app/hooks/useWareHouses';
import { SvgAdd } from 'app/icons/designSystem/SvgAdd';
import { SvgTransfer } from 'app/icons/designSystem/SvgTransfer';
import { SvgDelete } from 'app/icons/icons';
import SparePart from 'app/interfaces/SparePart';
import { StockMovementType } from 'app/interfaces/StockMovement';
import { WareHouseStockRequest } from 'app/interfaces/WareHouse';

import { ModalStockManage, SubmitDataStockRequest } from './ModalStockManage';

interface StockManageProps {
  sparePart: SparePart;
  operatorLoggedId: string;
  onStockUpdate: () => Promise<void>;
}

export const StockManage = ({
  sparePart,
  operatorLoggedId,
  onStockUpdate,
}: StockManageProps) => {
  const [modalType, setModalType] = useState<StockMovementType | undefined>(
    undefined
  );

  const { warehouseStockRequest } = useWareHouses();

  const canTransfer = useMemo(
    () => (sparePart?.warehouses?.length ?? 0) >= 2 && sparePart.stock > 0,
    [sparePart?.warehouses]
  );

  const open = (type: StockMovementType) => {
    if (operatorLoggedId == undefined || operatorLoggedId == '') {
      alert('Has de tenir un operari fitxat per fer aquesta acció');
      return;
    }
    if (type === StockMovementType.StockTransfer && !canTransfer) return; // bloquea si no hay 2
    setModalType(type);
  };

  const onSubmit = async (data: SubmitDataStockRequest) => {
    const request: WareHouseStockRequest = {
      wareHouseId: data.warehouseId,
      sparePartId: data.sparePartId,

      providerId: '',
      quantity: data.quantity,
      price: 0,
      operatorId: operatorLoggedId,
      stockMovementType: data.type,
      sparePartCode: sparePart.code,
      wareHouseTargetId: data.targetWarehouseId,
    };
    await warehouseStockRequest(request);
    setModalType(undefined);
    await onStockUpdate();
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium text-gray-600">
        Gestió de Stock
      </label>

      <div className="flex flex-row gap-4 items-start w-full">
        <div
          className="flex flex-col w-full text-center items-center gap-2 rounded-xl border-2 bg-okron-main/85 p-4 text-white hover:cursor-pointer hover:bg-okron-main"
          onClick={() => open(StockMovementType.StockAdjustment)}
        >
          <SvgAdd />
          <p>Afegir</p>
        </div>

        <div
          className="flex flex-col w-full text-center items-center gap-2 rounded-xl border-2 p-4 hover:bg-okron-requested hover:text-white hover:cursor-pointer"
          onClick={() => open(StockMovementType.StockLoss)}
        >
          <SvgDelete />
          <p>Retirar</p>
        </div>

        <div
          className={`flex flex-col w-full text-center items-center gap-2 rounded-xl border-2 p-4
            ${
              canTransfer
                ? 'hover:bg-okron-invoiced hover:text-white hover:cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
            }`}
          onClick={() => open(StockMovementType.StockTransfer)}
          title={
            canTransfer
              ? 'Transferir stock'
              : 'Necessites el recanvi en 2 magatzems'
          }
        >
          <SvgTransfer />
          <p>Transferir</p>
        </div>
      </div>

      <ModalStockManage
        open={modalType !== undefined}
        sparePart={sparePart}
        onClose={() => setModalType(undefined)}
        type={modalType!}
        onSubmit={async data => {
          onSubmit(data);
        }}
      />
    </div>
  );
};
