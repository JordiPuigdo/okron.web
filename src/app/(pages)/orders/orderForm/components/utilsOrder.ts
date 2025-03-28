import { Order } from 'app/interfaces/Order';
import { WareHouse } from 'app/interfaces/WareHouse';

export function generateNameHeader(isPurchase: boolean, orderRequest?: Order) {
  if (orderRequest != null) {
    return orderRequest.code;
  }
  return isPurchase ? 'Crear Compra' : 'Crear Recepció';
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
      active: true,
      quantityReceived: x.quantityReceived,
      quantityPendient: x.quantity - (x.quantityReceived ?? 0),
      estimatedDeliveryDate: x.estimatedDeliveryDate,
    };
  });
  return items;
}
