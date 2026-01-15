/**
 * Componentes reutilizables para paneles de previsualización.
 * Principio DRY: Centraliza componentes comunes entre Budget y DeliveryNote.
 */

export { ActionButton } from './ActionButton';
export { CommentBlock } from './CommentBlock';
export { CustomerInfo } from './CustomerInfo';
export type { CustomerData } from './CustomerInfo';
export { DateCard } from './DateCard';
export { ItemRow, ItemRowCompact, ItemType } from './ItemRow';
export type { ItemData } from './ItemRow';
export { StatusBadge } from './StatusBadge';
export { TotalsSummary } from './TotalsSummary';
export {
  calculateDeliveryNotesTotals,
  formatCurrency,
  formatDateShort,
  mapDeliveryNoteItemToItemData,
} from './utils';
export type { ItemData as ItemDataFromUtils, TotalsResult } from './utils';
export { formatCurrencyServerSider } from 'app/utils/utils';

// Invoice-specific components
export {
  DatesInfo as InvoiceDatesInfo,
  DeliveryNoteCard,
  DeliveryNotesList,
  PaymentMethodInfo,
} from './invoice';
