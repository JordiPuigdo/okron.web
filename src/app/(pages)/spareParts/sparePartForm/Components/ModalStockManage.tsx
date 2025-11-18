import { useMemo, useState } from 'react';
import { SvgAdd } from 'app/icons/designSystem/SvgAdd';
import { SvgTransfer } from 'app/icons/designSystem/SvgTransfer';
import { SvgDelete } from 'app/icons/icons';
import SparePart from 'app/interfaces/SparePart';
import { StockMovementType } from 'app/interfaces/StockMovement';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from 'components/ui/dialog';
import { Button } from 'designSystem/Button/Buttons';

import { WarehouseSelector } from './WareHouseSelector';

export type SubmitDataStockRequest =
  | {
      type:
        | StockMovementType.StockAdjustment
        | StockMovementType.StockLoss
        | StockMovementType.StockReturn
        | StockMovementType.StockEntry
        | StockMovementType.StockConsumption;
      sparePartId: string;
      warehouseId: string;
      sparePartCode: string;
      targetWarehouseId: string;
      quantity: number;
      reason?: string;
    }
  | {
      type: StockMovementType.StockTransfer;
      sparePartId: string;
      sparePartCode: string;
      warehouseId: string;
      targetWarehouseId: string;
      quantity: number;
      reason?: string;
    };

interface ModalStockManageProps {
  open: boolean;
  sparePart: SparePart;
  onClose: () => void;
  type: StockMovementType;
  onSubmit?: (data: SubmitDataStockRequest) => Promise<void> | void;
}

export const ModalStockManage = ({
  onClose,
  open,
  sparePart,
  type,
  onSubmit,
}: ModalStockManageProps) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const [warehouseId, setWarehouseId] = useState<string | null>(
    sparePart?.warehouses?.[0]?.warehouseId ?? null
  );
  const [originId, setOriginId] = useState<string | null>(
    sparePart?.warehouses?.[0]?.warehouseId ?? null
  );
  const [targetId, setTargetId] = useState<string | null>(
    sparePart?.warehouses?.[1]?.warehouseId ?? null
  );

  const header = useMemo(() => {
    switch (type) {
      case StockMovementType.StockAdjustment:
        return { icon: <SvgAdd />, title: 'Afegir Stock', cta: 'Afegir' };
      case StockMovementType.StockTransfer:
        return {
          icon: <SvgTransfer />,
          title: 'Transferir Stock',
          cta: 'Transferir',
        };
      case StockMovementType.StockLoss:
        return { icon: <SvgDelete />, title: 'Retirar Stock', cta: 'Retirar' };
      default:
        return { icon: null, title: 'Stock', cta: 'Guardar' };
    }
  }, [type]);

  const validQuantity = useMemo(
    () => Number.isFinite(quantity) && quantity > 0,
    [quantity]
  );

  const canTransfer = (sparePart?.warehouses?.length ?? 0) >= 2;

  const validByType = useMemo(() => {
    if (!validQuantity) return false;
    if (
      type === StockMovementType.StockAdjustment ||
      type === StockMovementType.StockLoss
    ) {
      return Boolean(warehouseId);
    }
    if (type === StockMovementType.StockTransfer) {
      return (
        canTransfer &&
        Boolean(originId) &&
        Boolean(targetId) &&
        originId !== targetId
      );
    }
    return false;
  }, [type, validQuantity, warehouseId, originId, targetId, canTransfer]);

  const swap = () => {
    if (!originId && !targetId) return;
    setOriginId(targetId);
    setTargetId(originId);
  };

  async function handleSubmit() {
    if (!validByType) return;
    let finalQuantity = quantity;
    if (
      type === StockMovementType.StockReturn ||
      type === StockMovementType.StockLoss
    ) {
      finalQuantity = quantity * -1;
    }
    try {
      setSubmitting(true);
      if (type === StockMovementType.StockTransfer) {
        await onSubmit?.({
          type,
          sparePartId: sparePart.id,
          warehouseId: originId!,
          targetWarehouseId: targetId!,
          quantity: finalQuantity,
          sparePartCode: sparePart.code,
          //reason: reason.trim() || undefined,
        });
      } else {
        await onSubmit?.({
          type,
          sparePartId: sparePart.id,
          warehouseId: warehouseId!,
          quantity: finalQuantity,
          sparePartCode: sparePart.code,
          targetWarehouseId: targetId!,
          //reason: reason.trim() || undefined,
        });
      }
      //onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex flex-row gap-2 items-center">
              {header.icon}
              <p className="text-lg font-semibold">{header.title}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-6">
          <div className="bg-okron-main p-4 rounded-lg">
            <p className="text-sm text-white">Stock actual</p>
            <p className="text-2xl font-bold text-white">{sparePart.stock}</p>
          </div>

          {/* Selectores por tipo */}
          {type === StockMovementType.StockTransfer ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Origen
                </label>
                <WarehouseSelector
                  warehouses={sparePart.warehouses}
                  value={originId}
                  onChange={setOriginId}
                  excludeIds={targetId ? [targetId] : undefined}
                  placeholderSearch="Cerca magatzem origen…"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Destí
                </label>
                <WarehouseSelector
                  warehouses={sparePart.warehouses}
                  value={targetId}
                  onChange={setTargetId}
                  excludeIds={originId ? [originId] : undefined}
                  placeholderSearch="Cerca magatzem destí…"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={swap}
                  className="px-3 py-2 rounded-lg border font-semibold hover:bg-slate-50"
                  disabled={!originId && !targetId}
                  title="Intercanviar origen i destí"
                >
                  Intercanviar
                </button>
              </div>

              {originId && targetId && originId === targetId && (
                <p className="md:col-span-2 text-xs text-red-600 -mt-2">
                  Origen i destí han de ser diferents.
                </p>
              )}
              {!canTransfer && (
                <p className="md:col-span-2 text-xs text-red-600 -mt-2">
                  Necessites el recanvi assignat a com a mínim dos magatzems.
                </p>
              )}
            </div>
          ) : (
            <WarehouseSelector
              warehouses={sparePart.warehouses}
              value={warehouseId}
              onChange={setWarehouseId}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold">Quantitat</label>
              <input
                type="number"
                min={1}
                className="text-lg rounded-lg w-full mt-2 border px-3 py-2"
                value={quantity}
                onChange={e => setQuantity(Math.max(0, Number(e.target.value)))}
              />
              {!validQuantity && (
                <p className="text-xs text-red-600 mt-1">
                  Introdueix una quantitat vàlida.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold">
                Motiu (opcional)
              </label>
              <input
                type="text"
                className="text-lg rounded-lg w-full mt-2 border px-3 py-2"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Ex: Ajust inventari, merma…"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="cancel" onClick={onClose} disabled={submitting}>
              Cancel·lar
            </Button>
            <Button
              type={
                type === StockMovementType.StockAdjustment
                  ? 'create'
                  : type === StockMovementType.StockLoss
                  ? 'delete'
                  : 'transfer'
              }
              as="button"
              htmlType="submit"
              disabled={!validByType || submitting}
              onClick={() => handleSubmit()}
            >
              {submitting ? 'Processant…' : header.cta}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
