'use client';
import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useOrder } from 'app/hooks/useOrder';
import { useWareHouses } from 'app/hooks/useWareHouses';
import {
  Order,
  OrderCreationRequest,
  OrderItemRequest,
  OrderSimple,
  OrderStatus,
  OrderType,
} from 'app/interfaces/Order';
import { Provider } from 'app/interfaces/Provider';
import SparePart from 'app/interfaces/SparePart';
import { useGlobalStore } from 'app/stores/globalStore';
import { translateOrderStatus } from 'app/utils/utilsOrder';
import { HeaderForm } from 'components/layout/HeaderForm';
import ca from 'date-fns/locale/ca';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import ModalOrderWareHouse from './ModalOrderWareHouse';
import ModalUnits from './ModalUnits';
import OrderDetailItems from './OrderDetailItems';
import OrderPurchase from './OrderPurchase';
import OrderPurchaseDetailItems from './OrderPurchaseDetailItems';
import ProviderInfo from './ProviderInfo';
import SearchOrderComponent from './SearchOrderComponent';
import SearchProviderComponent from './SearchProviderComponent';
import SearchSparePartOrderPurchase from './SearchSparePart';
import { generateNameHeader, mapItems } from './utilsOrder';

dayjs.extend(utc);

export interface OrderFormProps {
  isPurchase?: boolean;
  orderRequest?: Order;
}

export default function OrderForm({
  isPurchase,
  orderRequest,
}: OrderFormProps) {
  const { setIsModalOpen, isModalOpen } = useGlobalStore(state => state);
  const [isModalUnitsOpen, setIsModalUnitsOpen] = useState<boolean>(false);
  const [isModalWareHouseOpen, setIsModalWareHouseOpen] =
    useState<boolean>(false);
  const { createOrder, getNextCode, updateOrder } = useOrder();
  const { warehouses } = useWareHouses(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [order, setOrder] = useState<OrderCreationRequest>({
    code: '',
    providerId: '',
    items: [],
    status: OrderStatus.Pending,
    type: isPurchase ? OrderType.Purchase : OrderType.Delivery,
    comment: '',
    date: new Date().toISOString().split('T')[0],
    operatorId: '66156dc51a7347dfd58d8ca8',
    active: true,
    providerName: '',
  });

  const [orderPurchase, setOrderPurchase] = useState<OrderSimple | undefined>(
    undefined
  );
  const [selectedSparePart, setSelectedSparePart] = useState<
    SparePart | undefined
  >(undefined);
  const [selectedProvider, setSelectedProvider] = useState<
    Provider | undefined
  >(undefined);
  const [selectedWareHouseId, setSelectedWareHouseId] = useState<string | null>(
    null
  );

  const [selectedOrderItem, setSelectedOrderItem] = useState<
    OrderItemRequest | undefined
  >(undefined);

  const fetchCode = async () => {
    try {
      const code = await getNextCode(
        isPurchase ? OrderType.Purchase : OrderType.Delivery
      );
      setOrder({
        ...order,
        code: code,
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Error al obtener el código:', error);
    }
  };

  useEffect(() => {
    if (orderRequest == null) fetchCode();
  }, [isPurchase, orderRequest]);

  useEffect(() => {
    if (orderRequest != null) {
      loadOrder(orderRequest);
    }
  }, [orderRequest]);

  useEffect(() => {
    if (selectedSparePart && selectedSparePart?.wareHouseId.length > 1) {
      setIsModalWareHouseOpen(true);
      return;
    }
  }, [selectedSparePart]);

  useEffect(() => {
    if (!isModalOpen && isModalUnitsOpen) {
      setIsModalUnitsOpen(false);
    }
    if (!isModalOpen && isModalWareHouseOpen) {
      setIsModalWareHouseOpen(false);
    }
  }, [isModalOpen]);

  const onSelectedId = (id: string) => {
    setSelectedWareHouseId(id);
    setIsModalWareHouseOpen(false);
  };

  const onAddUnits = (units: number, sparePartId: string) => {
    const item = orderPurchase?.items.find(x => x.sparePartId === sparePartId);
    if (item) {
      const newItem: OrderItemRequest = {
        sparePartId: item.sparePartId,
        sparePart: item.sparePart,
        quantity: units,
        unitPrice: item.unitPrice,
        wareHouseId: item.wareHouseId,
        wareHouse: item.wareHouse,
      };
      item.quantity = item.quantity - units;
      setOrder({
        ...order,
        items: [...order.items, newItem],
      });
    }
    setIsModalUnitsOpen(false);
  };

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
      wareHouse: warehouses.find(x =>
        x.id == selectedWareHouseId
          ? selectedWareHouseId
          : selectedSparePart.wareHouseId[0]
      ),
    };

    setOrder(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    setSelectedSparePart(undefined);
  };

  function handleRemoveItem(index: number) {
    setOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  const handleCreateOrder = async () => {
    try {
      if (orderRequest == null) {
        await createOrder(order);
      } else {
        await updateOrder({
          ...order,
          id: orderRequest.id,
        });
      }

      alert('Order created successfully!');
    } catch (error) {
      console.error(error);
      alert('Error creating order');
    }
  };

  const handleChangeProvider = (provider: Provider) => {
    if (provider)
      setOrder({
        ...order,
        providerId: provider.id,
        providerName: provider.name,
      });

    if (provider == null)
      setOrder({
        ...order,
        items: [],
      });
    setSelectedProvider(provider);
  };

  function loadOrder(orderSelected: Order) {
    if (isPurchase) {
      setOrder(prev => ({
        ...prev,
        providerId: orderSelected.providerId,
        relationOrderId: orderSelected.id,
        code: orderSelected.code,
        status: orderSelected.status,
        type: orderSelected.type,
        comment: orderSelected.comment,
        date: orderSelected.date,
        active: orderSelected.active,
        operatorId: '66156dc51a7347dfd58d8ca8',
        items: mapItems(orderSelected, warehouses),
      }));
      setSelectedProvider(orderSelected.provider);
      setIsLoading(false);
    } else {
      setOrderPurchase({
        id: orderSelected.id,
        creationDate: orderSelected.creationDate,
        active: true,
        code: orderSelected.code,
        providerId: orderSelected.providerId,
        items: mapItems(orderSelected, warehouses),
        status: orderSelected.status,
        type: orderSelected.type,
        comment: orderSelected.comment,
        date: orderSelected.date,
        provider: orderSelected.provider,
      });
      setOrder(prev => ({
        ...prev,
        providerId: orderSelected.providerId,
        relationOrderId: orderSelected.id,
        operatorId: '66156dc51a7347dfd58d8ca8',
      }));
    }
  }

  const headerName = generateNameHeader(isPurchase!, orderRequest);

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
              ? { ...x, quantity: x.quantity + item.quantity }
              : x
          ),
        };
        setOrder(updatedOrder);
      } else {
        const updatedOrder = {
          ...order,
          items: [...order.items, item],
        };
        setOrder(updatedOrder);
      }

      if (orderPurchase?.items) {
        const updatedOrderPurchaseItems = orderPurchase.items.map(x => {
          if (x.sparePartId === item.sparePartId) {
            return { ...x, quantity: x.quantity - item.quantity }; // Reduce the quantity
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

  const handleDateChange = (date: any) => {
    const formattedDate = date ? dayjs(date).format('YYYY-MM-DD') : '';
    setOrder(prev => ({
      ...prev,
      date: formattedDate,
    }));
  };

  function handleChangePrice(items: OrderItemRequest[]) {
    setOrder({
      ...order,
      items: items,
    });
  }

  function handleReturnItem(item: OrderItemRequest) {
    setOrder(prev => ({
      ...prev,
      items: prev.items.filter(x => x.sparePartId !== item.sparePartId),
    }));
    if (orderPurchase?.items) {
      const updatedOrderPurchaseItems = orderPurchase.items.map(x => {
        if (x.sparePartId === item.sparePartId) {
          return { ...x, quantity: x.quantity + item.quantity };
        }
        return x;
      });
      setOrderPurchase({
        ...orderPurchase,
        items: updatedOrderPurchaseItems,
      });
    }
  }

  if (isLoading) return <div>Loading...</div>;
  return (
    <div className="flex flex-col h-full pb-4">
      <HeaderForm header={headerName} isCreate={orderRequest == null} />
      <div className="bg-white p-4 rounded-lg shadow-md flex-grow flex flex-col space-y-4 h-full">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold">Codi:</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              value={order.code}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Estat:</label>
            <select
              className="w-full p-2 border rounded-md"
              value={order.status}
              onChange={e =>
                setOrder({
                  ...order,
                  status: Number(e.target.value) as OrderStatus,
                })
              }
            >
              {Object.values(OrderStatus)
                .filter(value => typeof value === 'number')
                .map(status => (
                  <option key={status} value={status}>
                    {translateOrderStatus(status as OrderStatus)}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold">Data:</label>
            <DatePicker
              dateFormat="dd/MM/yyyy"
              locale={ca}
              className="w-full p-2 border rounded-md"
              selected={dayjs(order.date).toDate()}
              onChange={date => {
                handleDateChange(date);
              }}
            />
            {orderRequest && (
              <div className="mt-4">
                <label className="block text-sm font-semibold">Actiu:</label>
                <input
                  type="checkbox"
                  className="p-2 border rounded-md"
                  checked={order.active}
                  onChange={e =>
                    setOrder({ ...order, active: e.target.checked })
                  }
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold">Comentari:</label>
            <textarea
              className="w-full p-2 border rounded-md"
              value={order.comment}
              onChange={e => setOrder({ ...order, comment: e.target.value })}
            />
          </div>
          <div>
            {orderRequest == null && (
              <>
                <label className="block text-sm font-semibold">
                  {isPurchase ? 'Proveeïdor' : 'Ordre Compra:'}
                </label>
                {isPurchase ? (
                  <SearchProviderComponent
                    onSelectedProvider={handleChangeProvider}
                  />
                ) : (
                  <SearchOrderComponent onSelectedOrder={loadOrder} />
                )}
              </>
            )}
          </div>
          <div>
            {orderPurchase && <OrderPurchase order={orderPurchase} />}
            {!orderPurchase && selectedProvider && (
              <ProviderInfo provider={selectedProvider} />
            )}
          </div>
        </div>
        <div className="flex flex-col h-full">
          {isPurchase && (
            <SearchSparePartOrderPurchase
              handleAddOrderItem={handleAddOrderItem}
              onSelectedSparePart={setSelectedSparePart}
              selectedProvider={selectedProvider}
            />
          )}
          {isPurchase || orderRequest != null ? (
            <OrderDetailItems
              handleRemoveItem={handleRemoveItem}
              items={order.items}
              canEdit={orderRequest == null}
              onChangePrice={handleChangePrice}
            />
          ) : (
            orderPurchase && (
              <>
                <OrderPurchaseDetailItems
                  handleRecieveItem={handleRecieveItem}
                  items={orderPurchase.items}
                  isOrderPurchase={true}
                />
                <OrderPurchaseDetailItems
                  handleRecieveItem={handleReturnItem}
                  items={order.items}
                  isOrderPurchase={false}
                />
              </>
            )
          )}
        </div>
        <div className="mt-auto">
          <div className="flex flex-row justify-between p-4 border-t border-b my-4 px-16">
            <div className="font-bold">Total:</div>
            <div className="font-bold">
              {order.items.reduce(
                (acc, item) => acc + Number(item.unitPrice) * item.quantity,
                0
              )}
              €
            </div>
          </div>
          <button
            onClick={handleCreateOrder}
            className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
          >
            {orderRequest == null ? headerName : 'Actualitzar'}
          </button>
        </div>
      </div>
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
