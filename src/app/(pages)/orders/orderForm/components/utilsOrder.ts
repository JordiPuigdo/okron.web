import { Order, OrderStatus } from 'app/interfaces/Order';
import { WareHouse } from 'app/interfaces/WareHouse';

export function generateNameHeader(
  isPurchase: boolean,
  t: (key: string) => string,
  orderRequest?: Order,
  code = ''
) {
  if (orderRequest != null) {
    return orderRequest.code;
  }
  return isPurchase
    ? `${t('order.create.purchase')} ${code && ' > ' + code} `
    : t('order.create.reception');
}

export function mapItems(orderSelected: Order, warehouses: WareHouse[]) {
  const items = orderSelected.items.map(x => {
    return {
      id: x.id,
      sparePartId: x.sparePartId,
      quantity: x.quantity,
      unitPrice: x.unitPrice.toString(),
      sparePart: x.sparePart,
      wareHouseId: x.wareHouseId,
      providerId: orderSelected.providerId,
      creationDate: orderSelected.creationDate,
      wareHouse: warehouses.find(w => w.id === x.wareHouseId),
      wareHouseName: x.wareHouseName,
      sparePartName: x.sparePartName,
      active: true,
      quantityReceived: x.quantityReceived,
      quantityPendient: x.quantity - (x.quantityReceived ?? 0),
      estimatedDeliveryDate: x.estimatedDeliveryDate,
      refProvider: x.refProvider,
      discount: x.discount,
    };
  });
  return items;
}

export function translateOrderState(state: OrderStatus, t: (key: string) => string): string {
  switch (state) {
    case OrderStatus.Pending:
      return t('order.status.pending');
    case OrderStatus.Completed:
      return t('order.status.completed');
    case OrderStatus.Cancelled:
      return t('order.status.cancelled');
    case OrderStatus.InProgress:
      return t('order.status.in.progress');
    default:
      return t('order.status.unknown');
  }
}
