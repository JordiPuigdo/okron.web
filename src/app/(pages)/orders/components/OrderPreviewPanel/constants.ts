import { OrderStatus, OrderType } from 'app/interfaces/Order';

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================

export const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  [OrderStatus.Pending]: {
    label: 'Pendent',
    className: 'bg-yellow-100 text-yellow-700',
  },
  [OrderStatus.InProgress]: {
    label: 'En Curs',
    className: 'bg-blue-100 text-blue-700',
  },
  [OrderStatus.Completed]: {
    label: 'Completada',
    className: 'bg-green-100 text-green-700',
  },
  [OrderStatus.Cancelled]: {
    label: 'Cancel·lada',
    className: 'bg-gray-100 text-gray-500',
  },
};

// ============================================================================
// ORDER TYPE CONFIGURATION
// ============================================================================

export const ORDER_TYPE_CONFIG: Record<
  OrderType,
  { label: string; icon: string }
> = {
  [OrderType.Purchase]: { label: 'Comanda', icon: '📦' },
  [OrderType.Delivery]: { label: 'Albarà Recepció', icon: '🚚' },
  [OrderType.Return]: { label: 'Devolució', icon: '↩️' },
};

// ============================================================================
// TAX CONFIGURATION
// ============================================================================

export const TAX_RATE = 0.21; // 21% IVA
