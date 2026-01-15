/**
 * Re-exporta utilidades compartidas para los paneles de previsualización.
 * Principio DRY: Reutiliza funciones existentes de app/utils.
 */

import { DeliveryNote, DeliveryNoteItem } from 'app/interfaces/DeliveryNote';

export { formatCurrencyServerSider as formatCurrency } from 'app/utils/utils';

/**
 * Formatea una fecha Date a formato catalán corto (dd/mm/yyyy).
 * Nota: Diferente de formatDate de app/utils que acepta strings.
 */
export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('ca-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Calcula los totales agregados de un conjunto de albaranes.
 * Reutilizable para facturas y otros contextos que agrupen delivery notes.
 */
export interface TotalsResult {
  subtotal: number;
  totalTax: number;
  total: number;
}

export function calculateDeliveryNotesTotals(
  deliveryNotes: DeliveryNote[]
): TotalsResult {
  if (!deliveryNotes || deliveryNotes.length === 0) {
    return { subtotal: 0, totalTax: 0, total: 0 };
  }

  const subtotal = deliveryNotes.reduce(
    (sum, dn) => sum + (dn.subtotal || 0),
    0
  );
  const totalTax = deliveryNotes.reduce(
    (sum, dn) => sum + (dn.totalTax || 0),
    0
  );
  const total = deliveryNotes.reduce((sum, dn) => sum + (dn.total || 0), 0);

  return { subtotal, totalTax, total };
}

/**
 * Mapea un DeliveryNoteItem al formato ItemData usado por ItemRow/ItemRowCompact.
 */
export interface ItemData {
  id: string;
  type: number;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  lineTotal: number;
  taxPercentage?: number;
}

export function mapDeliveryNoteItemToItemData(
  item: DeliveryNoteItem
): ItemData {
  return {
    id: item.id,
    type: item.type as number,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discountPercentage: item.discountPercentage,
    lineTotal: item.lineTotal,
    taxPercentage: item.taxPercentage,
  };
}
