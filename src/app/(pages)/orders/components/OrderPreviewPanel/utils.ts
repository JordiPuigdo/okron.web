import { OrderItem } from 'app/interfaces/Order';

import { TAX_RATE } from './constants';
import { OrderTotals } from './types';

// ============================================================================
// FINANCIAL CALCULATIONS
// ============================================================================

/**
 * Calcula totales de la orden.
 * SRP: Solo cálculos financieros.
 */
export function calculateOrderTotals(items: OrderItem[]): OrderTotals {
  const subtotal = items.reduce((acc, item) => {
    const unitPrice = parseFloat(item.unitPrice) || 0;
    return acc + item.quantity * unitPrice * (1 - item.discount / 100);
  }, 0);

  const totalTax = subtotal * TAX_RATE;
  const total = subtotal + totalTax;

  return { subtotal, total, totalTax };
}

// ============================================================================
// RECEPTION CALCULATIONS
// ============================================================================

/**
 * Calcula progreso global de recepción.
 */
export function calculateReceptionProgress(items: OrderItem[]): number {
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalReceived = items.reduce(
    (acc, item) => acc + item.quantityReceived,
    0
  );

  return totalQuantity > 0
    ? Math.round((totalReceived / totalQuantity) * 100)
    : 0;
}

/**
 * Calcula porcentaje de recepción de un item.
 */
export function calculateItemReceptionPercentage(
  quantity: number,
  quantityReceived: number
): number {
  return quantity > 0 ? Math.round((quantityReceived / quantity) * 100) : 0;
}

/**
 * Calcula el total de línea con descuento.
 */
export function calculateLineTotal(
  quantity: number,
  unitPrice: string,
  discount: number
): number {
  const price = parseFloat(unitPrice) || 0;
  return quantity * price * (1 - discount / 100);
}
