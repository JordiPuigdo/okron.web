import { useEffect, useState } from 'react';
import {
  OrderCreationRequest,
  OrderItemRequest,
  OrderSimple,
  OrderStatus,
  OrderType,
} from 'app/interfaces/Order';
import { Provider } from 'app/interfaces/Provider';
import SparePart, { WarehousesSparePart } from 'app/interfaces/SparePart';
import { WareHouse } from 'app/interfaces/WareHouse';
import { useGlobalStore } from 'app/stores/globalStore';

import ModalOrderWareHouse from './ModalOrderWareHouse';
import ModalUnits from './ModalUnits';
import OrderDetailItems from './OrderDetailItems';
import OrderPurchaseDetailItems from './OrderPurchaseDetailItems';
import SearchSparePartOrderPurchase from './SearchSparePart';

interface BodyOrderFormProps {
  order: OrderCreationRequest;
  isEditing: boolean;
  selectedSparePart: SparePart | undefined;
  setSelectedSparePart: (sparePart: SparePart | undefined) => void;
  selectedProvider: Provider | undefined;
  warehouses: WareHouse[];
  setOrder: (order: OrderCreationRequest) => void;
  orderPurchase?: OrderSimple;
  setOrderPurchase: (orderPurchase: OrderSimple) => void;
}

export function BodyOrderForm({
  order,
  isEditing,
  selectedSparePart,
  setSelectedSparePart,
  selectedProvider,
  warehouses,
  setOrder,
  orderPurchase,
  setOrderPurchase,
}: BodyOrderFormProps) {
  const { isModalOpen } = useGlobalStore(state => state);
  const [isModalUnitsOpen, setIsModalUnitsOpen] = useState<boolean>(false);
  const [isModalWareHouseOpen, setIsModalWareHouseOpen] =
    useState<boolean>(false);
  const [selectedWareHouse, setSelectedWareHouse] =
    useState<WarehousesSparePart | null>(null);

  const [selectedOrderItem, setSelectedOrderItem] = useState<
    OrderItemRequest | undefined
  >(undefined);

  useEffect(() => {
    if (!isModalOpen && isModalUnitsOpen) {
      setIsModalUnitsOpen(false);
    }
    if (!isModalOpen && isModalWareHouseOpen) {
      setIsModalWareHouseOpen(false);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (selectedSparePart && selectedSparePart?.warehouses.length > 1) {
      setIsModalWareHouseOpen(true);
      return;
    }
  }, [selectedSparePart]);

  const handleAddOrderItem = (item: OrderItemRequest) => {
    if (!selectedSparePart) return;

    const newItem: OrderItemRequest = {
      sparePartId: selectedSparePart.id,
      sparePart: selectedSparePart,
      provider: selectedProvider,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      refProvider: item.refProvider,
      discount: item.discount,
      wareHouseId: selectedWareHouse
        ? selectedWareHouse.warehouseId
        : selectedSparePart.warehouses[0].warehouseId,
      wareHouse: warehouses.find(
        x =>
          x.id ==
          (selectedWareHouse !== null
            ? selectedWareHouse.warehouseId
            : selectedSparePart.warehouses[0].warehouseId)
      ),
      wareHouseName: item.wareHouseName,
      estimatedDeliveryDate: new Date().toISOString().split('T')[0],
    };

    setOrder({
      ...order,
      items: [...order.items, newItem],
    });
    setSelectedWareHouse(null);
    setSelectedSparePart(undefined);
  };
  function handleRemoveItem(index: number) {
    setOrder({
      ...order,
      items: order.items.filter((_, i) => i !== index),
    });
  }

  function handleChangePrice(items: OrderItemRequest[]) {
    setOrder({
      ...order,
      items: items,
    });
  }

  function handleReturnItem(item: OrderItemRequest) {
    setOrder({
      ...order,
      items: order.items.filter(x => x.sparePartId !== item.sparePartId),
    });
    if (orderPurchase?.items) {
      const updatedOrderPurchaseItems = orderPurchase.items.map(x => {
        if (x.sparePartId === item.sparePartId) {
          return {
            ...x,
            quantityPendient: (x.quantityPendient ?? 0) + item.quantity,
          };
        }
        return x;
      });
      setOrderPurchase({
        ...orderPurchase,
        items: updatedOrderPurchaseItems,
      });
    }
  }

  function handleReceiveItem(
    item: OrderItemRequest,
    isPartial: boolean,
    receiveAll: boolean = false
  ) {
    if (isPartial) {
      setSelectedOrderItem(item);
      setIsModalUnitsOpen(true);
      return;
    }

    // Handle receive all items case
    if (receiveAll && orderPurchase?.items) {
      const updatedOrderItems = orderPurchase.items.map(orderItem => {
        const purchaseItem = orderPurchase.items.find(
          x => x.sparePartId === orderItem.sparePartId
        );
        return purchaseItem
          ? {
              ...orderItem,
              quantityReceived:
                (orderItem.quantityReceived ?? 0) +
                (purchaseItem.quantityPendient ?? 0),
            }
          : orderItem;
      });
      const updatedOrderPurchaseItems = orderPurchase.items.map(item => ({
        ...item,
        quantityPendient: 0,
      }));

      setOrder({
        ...order,
        items: updatedOrderItems,
      });
      setOrderPurchase({
        ...orderPurchase,
        items: updatedOrderPurchaseItems,
      });
      return;
    }

    // Handle single item case
    const itemExists = order.items.some(
      x => x.sparePartId === item.sparePartId
    );

    const updatedOrderItems = itemExists
      ? order.items.map(x =>
          x.sparePartId === item.sparePartId
            ? {
                ...x,
                quantityReceived: (x.quantityReceived ?? 0) + item.quantity,
              }
            : x
        )
      : [...order.items, { ...item, quantityReceived: item.quantity }];

    setOrder({
      ...order,
      items: updatedOrderItems,
    });

    if (orderPurchase?.items) {
      const updatedOrderPurchaseItems = orderPurchase.items.map(x =>
        x.sparePartId === item.sparePartId
          ? {
              ...x,
              quantityPendient: 0,
            }
          : x
      );

      setOrderPurchase({
        ...orderPurchase,
        items: updatedOrderPurchaseItems,
      });
    }
  }
  const onAddUnits = (units: number, sparePartId: string) => {
    const exists = order.items.find(x => x.sparePartId === sparePartId);
    if (exists) {
      const newItem: OrderItemRequest = {
        sparePartId: exists.sparePartId,
        sparePart: exists.sparePart,
        quantity: exists.quantity + units,
        unitPrice: exists.unitPrice,
        wareHouseId: exists.wareHouseId,
        wareHouse: exists.wareHouse,
        refProvider: exists.refProvider,
        discount: exists.discount,
        wareHouseName: exists.wareHouseName,
      };
      exists.quantityPendient = (exists.quantityPendient ?? 0) - units;
      const updatedItems = order.items.map(x =>
        x.sparePartId === sparePartId ? newItem : x
      );
      setOrder({
        ...order,
        items: updatedItems,
      });
    } else {
      const item = orderPurchase?.items.find(
        x => x.sparePartId === sparePartId
      );
      if (item) {
        const newItem: OrderItemRequest = {
          sparePartId: item.sparePartId,
          sparePart: item.sparePart,
          quantity: units,
          unitPrice: item.unitPrice,
          wareHouseId: item.wareHouseId,
          wareHouse: item.wareHouse,
          refProvider: item.refProvider,
          discount: item.discount,
          wareHouseName: item.wareHouseName,
        };
        setOrder({
          ...order,
          items: [...order.items, newItem],
        });
      }
    }
    if (orderPurchase?.items) {
      const updatedOrderPurchaseItems = orderPurchase.items.map(x => {
        if (x.sparePartId === sparePartId) {
          return {
            ...x,
            quantityPendient: (x.quantityPendient ?? 0) - units,
          };
        }
        return x;
      });

      setOrderPurchase({
        ...orderPurchase,
        items: updatedOrderPurchaseItems,
      });
    }

    setIsModalUnitsOpen(false);
  };
  const onSelectedId = (id: string) => {
    const selected = warehouses.find(x => x.id == id);
    const newWarehouse = {
      warehouseId: selected!.id,
      warehouseName: selected!.description,
    };
    setSelectedWareHouse(newWarehouse);
    setIsModalWareHouseOpen(false);
  };

  function handleChangeEstimatedDeliveryDate(items: OrderItemRequest[]) {
    setOrder({
      ...order,
      items: items,
    });
  }
  function handleChangeQuantity(items: OrderItemRequest[]) {
    setOrder({
      ...order,
      items: items,
    });
  }
  function handleChangeDiscount(items: OrderItemRequest[]) {
    setOrder({
      ...order,
      items: items,
    });
  }
  return (
    <div className="flex flex-col h-full">
      {order.type == OrderType.Purchase && !isEditing && (
        <SearchSparePartOrderPurchase
          handleAddOrderItem={handleAddOrderItem}
          onSelectedSparePart={setSelectedSparePart}
          selectedProvider={selectedProvider}
        />
      )}
      {order.type == OrderType.Purchase ? (
        <OrderDetailItems
          handleRemoveItem={handleRemoveItem}
          items={order.items}
          canEdit={!isEditing || order.status == OrderStatus.Pending}
          onChangePrice={handleChangePrice}
          onChangeEstimatedDeliveryDate={handleChangeEstimatedDeliveryDate}
          onChangeQuantity={handleChangeQuantity}
          onChangeDiscount={handleChangeDiscount}
        />
      ) : (
        <>
          <OrderPurchaseDetailItems
            handleRecieveItem={handleReceiveItem}
            items={orderPurchase?.items ?? []}
            isOrderPurchase={true}
          />
          <OrderPurchaseDetailItems
            handleRecieveItem={handleReturnItem}
            items={order.items}
            isOrderPurchase={false}
          />
        </>
      )}
      {isModalWareHouseOpen && (
        <ModalOrderWareHouse
          wareHouseIds={
            (selectedSparePart &&
              selectedSparePart?.warehouses.map(x => x.warehouseId)) ||
            []
          }
          onSelectedId={onSelectedId}
          wareHouses={warehouses}
        />
      )}
      {isModalUnitsOpen && selectedOrderItem && (
        <ModalUnits item={selectedOrderItem} onAddUnits={onAddUnits} />
      )}
    </div>
  );
}
