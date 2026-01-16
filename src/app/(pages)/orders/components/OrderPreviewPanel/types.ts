import { Order } from 'app/interfaces/Order';

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface OrderPreviewPanelProps {
  /** Orden a mostrar */
  order: Order | null;
  /** Controla si el panel está abierto */
  isOpen: boolean;
  /** Callback cuando se cierra */
  onClose: () => void;
  /** Callback opcional para refrescar datos después de editar */
  onRefresh?: () => void;
}

export interface ProviderInfoProps {
  provider: Order['provider'];
  providerName?: string;
}

export interface OrderItemsListProps {
  items: Order['items'];
}

export interface OrderItemRowProps {
  item: Order['items'][number];
}

export interface RelatedOrdersListProps {
  /** Órdenes relacionadas con detalle completo */
  relatedOrders: Order[];
  /** Callback para navegar al detalle de una orden */
  onNavigate: (orderId: string) => void;
}

// ============================================================================
// CALCULATED TYPES
// ============================================================================

export interface OrderTotals {
  subtotal: number;
  total: number;
  totalTax: number;
}
