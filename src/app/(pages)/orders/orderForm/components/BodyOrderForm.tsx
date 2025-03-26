import { useEffect, useState } from 'react';
import {
  OrderCreationRequest,
  OrderItemRequest,
  OrderSimple,
  OrderType,
} from 'app/interfaces/Order';
import { Provider } from 'app/interfaces/Provider';
import SparePart from 'app/interfaces/SparePart';
import { WareHouse } from 'app/interfaces/WareHouse';
import { useGlobalStore } from 'app/stores/globalStore';
import dayjs from 'dayjs';

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
  const [selectedWareHouseId, setSelectedWareHouseId] = useState<string | null>(
    null
  );

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
    if (selectedSparePart && selectedSparePart?.wareHouseId.length > 1) {
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
      wareHouseId: selectedWareHouseId
        ? selectedWareHouseId
        : selectedSparePart.wareHouseId[0],
      wareHouse: warehouses.find(
        x =>
          x.id ==
          (selectedWareHouseId !== null
            ? selectedWareHouseId
            : selectedSparePart.wareHouseId[0])
      ),
      estimatedDeliveryDate: new Date().toISOString().split('T')[0],
    };

    setOrder({
      ...order,
      items: [...order.items, newItem],
    });
    setSelectedWareHouseId(null);
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

  function handleRecieveItem(item: OrderItemRequest, isPartial: boolean) {
    if (isPartial) {
      setSelectedOrderItem(item);
      setIsModalUnitsOpen(true);
    } else {
      const itemExists = order.items.find(
        x => x.sparePartId === item.sparePartId
      );
      if (itemExists) {
        const updatedOrder = {
          ...order,
          items: order.items.map(x =>
            x.sparePartId === item.sparePartId
              ? {
                  ...x,
                  quantityReceived: x.quantityReceived ?? 0 + item.quantity,
                }
              : x
          ),
        };
        setOrder(updatedOrder);
      } else {
        const updatedOrder = {
          ...order,
          items: [...order.items, { ...item, quantityReceived: item.quantity }],
        };
        setOrder(updatedOrder);
      }

      if (orderPurchase?.items) {
        const updatedOrderPurchaseItems = orderPurchase.items.map(x => {
          if (x.sparePartId === item.sparePartId) {
            return {
              ...x,
              quantityPendient: 0,
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
    setSelectedWareHouseId(id);
    setIsModalWareHouseOpen(false);
  };

  function handleChangeEstimatedDeliveryDate(items: OrderItemRequest[]) {
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
          canEdit={!isEditing}
          onChangePrice={handleChangePrice}
          onChangeEstimatedDeliveryDate={handleChangeEstimatedDeliveryDate}
        />
      ) : (
        <>
          <OrderPurchaseDetailItems
            handleRecieveItem={handleRecieveItem}
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
            (selectedSparePart && selectedSparePart?.wareHouseId) || []
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
