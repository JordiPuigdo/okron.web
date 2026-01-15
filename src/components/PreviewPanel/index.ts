/**
 * Componentes reutilizables para paneles de previsualización.
 * Principio DRY: Centraliza componentes comunes entre Budget y DeliveryNote.
 */

export { ActionButton } from './ActionButton';
export { CommentBlock } from './CommentBlock';
export type { CustomerData } from './CustomerInfo';
export { CustomerInfo } from './CustomerInfo';
export { DateCard } from './DateCard';
export { formatCurrencyServerSider } from 'app/utils/utils';
// Invoice-specific components
export {
  DeliveryNoteCard,
  DeliveryNotesList,
  DatesInfo as InvoiceDatesInfo,
  PaymentMethodInfo,
} from './invoice';
export type { ItemData } from './ItemRow';
export { ItemRow, ItemRowCompact, ItemType } from './ItemRow';
export { StatusBadge } from './StatusBadge';
export { TotalsSummary } from './TotalsSummary';
export type { ItemData as ItemDataFromUtils, TotalsResult } from './utils';
export {
  calculateDeliveryNotesTotals,
  formatCurrency,
  formatDateShort,
  mapDeliveryNoteItemToItemData,
} from './utils';
