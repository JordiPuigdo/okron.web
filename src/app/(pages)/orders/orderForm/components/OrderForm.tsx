'use client';

import { useEffect, useState } from 'react';
import { useOrder } from 'app/hooks/useOrder';
import { useWareHouses } from 'app/hooks/useWareHouses';
import {
  Order,
  OrderCreationRequest,
  OrderSimple,
  OrderStatus,
  OrderType,
} from 'app/interfaces/Order';
import { Provider } from 'app/interfaces/Provider';
import SparePart from 'app/interfaces/SparePart';
import { HeaderForm } from 'components/layout/HeaderForm';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { BodyOrderForm } from './BodyOrderForm';
import HeaderOrderForm from './HeaderOrderForm';
import OrderPurchase from './OrderPurchase';
import ProviderInfo from './ProviderInfo';
import { generateNameHeader, mapItems } from './utilsOrder';

dayjs.extend(utc);

export interface OrderFormProps {
  isPurchase?: boolean;
  orderRequest?: Order;
  isPdf?: boolean;
  purchaseOrderId?: string;
}

export default function OrderForm({
  isPurchase,
  orderRequest,
  isPdf,
  purchaseOrderId,
}: OrderFormProps) {
  const { createOrder, getNextCode, updateOrder, fetchOrderById } = useOrder();
  const { warehouses } = useWareHouses(true);
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

  const fetchCode = async () => {
    try {
      const code = await getNextCode(
        isPurchase ? OrderType.Purchase : OrderType.Delivery
      );
      if (purchaseOrderId) {
        const orderResponse = await fetchOrderById(purchaseOrderId!);
        setOrder({
          ...order,
          code: code,
          providerId: orderResponse.providerId,
          providerName: orderResponse.provider?.name,
          relationOrderId: orderResponse.id,
          relationOrderCode: orderResponse.code,
        });
        setOrderPurchase({
          ...orderResponse,
          items: orderResponse.items.map(x => ({
            ...x,
            quantityPendient: x.quantity - (x.quantityReceived ?? 0),
          })),
        });
      } else {
        setOrder({
          ...order,
          code: code,
        });
      }
    } catch (error) {
      console.error('Error al obtener el código:', error);
    }
  };

  useEffect(() => {
    if (orderRequest == null) fetchCode();
  }, [isPurchase, orderRequest, purchaseOrderId]);

  useEffect(() => {
    if (orderRequest != null) {
      loadOrder(orderRequest);
    }
  }, [orderRequest]);

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

  async function loadOrder(orderSelected: Order) {
    if (
      isPurchase ||
      (orderRequest != null && orderRequest.type == OrderType.Purchase)
    ) {
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
    } else {
      const orderResponse = await fetchOrderById(
        orderSelected.relationOrderId!
      );
      setOrderPurchase({
        id: orderSelected.id,
        creationDate: orderSelected.creationDate,
        active: true,
        code: orderSelected.relationOrderCode ?? '',
        providerId: orderSelected.providerId,
        items: mapItems(orderResponse, warehouses),
        status: orderResponse.status,
        type: orderResponse.type,
        comment: orderResponse.comment,
        date: orderResponse.date,
        provider: orderResponse.provider,
        relationOrderId: orderSelected.relationOrderId,
        relationOrderCode: orderSelected.relationOrderCode,
      });
      setOrder(prev => ({
        ...prev,
        code: orderSelected.code,
        comment: orderSelected.comment,
        date: orderSelected.date,
        active: orderSelected.active,
        deliveryProviderDate: orderSelected.deliveryProviderDate,
        deliveryProviderCode: orderSelected.deliveryProviderCode,
        providerId: orderSelected.providerId,
        relationOrderId: orderSelected.relationOrderId,
        relationOrderCode: orderSelected.relationOrderCode,
        items: mapItems(orderSelected, warehouses),
      }));
    }
  }

  const headerName = generateNameHeader(isPurchase!, orderRequest);

  function handleLoadOrderFromScratch(orderRequest: Order) {
    setOrderPurchase({
      ...orderRequest,
      items: mapItems(orderRequest, warehouses),
    });
    setOrder(prev => ({
      ...prev,
      providerId: orderRequest.providerId,
      providerName: orderRequest.provider?.name,
      relationOrderId: orderRequest.id,
      relationOrderCode: orderRequest.code,
    }));
  }

  return (
    <div className="flex flex-col h-full pb-4">
      <HeaderForm header={headerName} isCreate={orderRequest == null} />
      <div className="bg-white p-4 rounded-lg shadow-md flex-grow flex flex-col space-y-4 h-full">
        <HeaderOrderForm
          order={order}
          setOrder={setOrder}
          handleChangeProvider={handleChangeProvider}
          loadOrderFromScratch={handleLoadOrderFromScratch}
          isEditing={orderRequest != null}
        />
        {orderPurchase && <OrderPurchase order={orderPurchase} />}
        {order.type == OrderType.Purchase && selectedProvider && (
          <ProviderInfo provider={selectedProvider} />
        )}
        <BodyOrderForm
          order={order}
          isEditing={orderRequest != null}
          selectedSparePart={selectedSparePart}
          setSelectedSparePart={setSelectedSparePart}
          selectedProvider={selectedProvider}
          warehouses={warehouses}
          setOrder={setOrder}
          orderPurchase={orderPurchase ?? undefined}
          setOrderPurchase={setOrderPurchase}
        />
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
    </div>
  );
}
