'use client';

import { OrderItemRow } from './OrderItemRow';
import { OrderItemsListProps } from './types';

/**
 * Lista de items de la orden.
 * SRP: Solo muestra la lista de items.
 */
export function OrderItemsList({ items }: OrderItemsListProps) {
  if (!items || items.length === 0) {
    return <EmptyItemsMessage />;
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <OrderItemRow key={item.id || index} item={item} />
      ))}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENT: Mensaje vacío
// ============================================================================

function EmptyItemsMessage() {
  return <p className="text-gray-500 text-sm">No hi ha ítems</p>;
}
