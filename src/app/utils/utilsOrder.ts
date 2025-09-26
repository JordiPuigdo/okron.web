import { OrderStatus, OrderType } from 'app/interfaces/Order';

export function translateOrderStatus(status: OrderStatus, t?: (key: string) => string) {
  if (!t) {
    // Fallback to hardcoded values if translation function is not provided
    switch (status) {
      case OrderStatus.Pending:
        return 'Pendent';
      case OrderStatus.InProgress:
        return 'En procés';
      case OrderStatus.Completed:
        return 'Completat';
      case OrderStatus.Cancelled:
        return 'Cancel·lat';
      default:
        return 'Unknown';
    }
  }

  switch (status) {
    case OrderStatus.Pending:
      return t('order.status.pending');
    case OrderStatus.InProgress:
      return t('order.status.in.progress');
    case OrderStatus.Completed:
      return t('order.status.completed');
    case OrderStatus.Cancelled:
      return t('order.status.cancelled');
    default:
      return t('order.status.unknown');
  }
}

export function translateOrderType(type: OrderType) {
  switch (type) {
    case OrderType.Purchase:
      return 'Comanda';
    case OrderType.Delivery:
      return 'Recepció';
    case OrderType.Return:
      return 'Devolució';
    default:
      return 'Unknown';
  }
}
