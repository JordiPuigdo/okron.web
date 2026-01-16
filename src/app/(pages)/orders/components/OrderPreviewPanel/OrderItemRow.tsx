'use client';

import { OrderItemRowProps } from './types';
import { calculateItemReceptionPercentage, calculateLineTotal } from './utils';

/**
 * Fila individual de item.
 * SRP: Renderiza un solo item con su información de recepción.
 */
export function OrderItemRow({ item }: OrderItemRowProps) {
  const unitPrice = parseFloat(item.unitPrice) || 0;
  const lineTotal = calculateLineTotal(
    item.quantity,
    item.unitPrice,
    item.discount
  );
  const receivedPercentage = calculateItemReceptionPercentage(
    item.quantity,
    item.quantityReceived
  );
  const isComplete = item.quantityReceived >= item.quantity;

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      {/* Nombre y precio total */}
      <div className="flex justify-between items-start mb-2">
        <span className="font-medium text-gray-900 flex-1">
          {item.sparePartName || item.sparePart?.code || '-'}
        </span>
        <span className="text-sm font-semibold text-gray-900">
          {lineTotal.toFixed(2)} €
        </span>
      </div>

      {/* Detalles de cantidad y precio unitario */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">
          {item.quantity} x {unitPrice.toFixed(2)} €
          {item.discount > 0 && (
            <span className="text-orange-600 ml-1">(-{item.discount}%)</span>
          )}
        </span>
      </div>

      {/* Barra de progreso de recepción */}
      <ReceptionProgressBar
        received={item.quantityReceived}
        total={item.quantity}
        percentage={receivedPercentage}
        isComplete={isComplete}
      />
    </div>
  );
}

// ============================================================================
// SUB-COMPONENT: Barra de progreso
// ============================================================================

interface ReceptionProgressBarProps {
  received: number;
  total: number;
  percentage: number;
  isComplete: boolean;
}

function ReceptionProgressBar({
  received,
  total,
  percentage,
  isComplete,
}: ReceptionProgressBarProps) {
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">Rebut:</span>
        <span className={isComplete ? 'text-green-600' : 'text-amber-600'}>
          {received} / {total} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${
            isComplete ? 'bg-green-500' : 'bg-amber-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
