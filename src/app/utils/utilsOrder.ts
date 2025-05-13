import { OrderStatus, OrderType } from 'app/interfaces/Order';

export function translateOrderStatus(status: OrderStatus) {
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
