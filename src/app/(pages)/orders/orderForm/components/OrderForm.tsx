'use client';

import { useEffect, useState } from 'react';
import { useOrder } from 'app/hooks/useOrder';
import { useWareHouses } from 'app/hooks/useWareHouses';
import { Account } from 'app/interfaces/Account';
import {
  Order,
  OrderCreationRequest,
  OrderSimple,
  OrderStatus,
  OrderType,
} from 'app/interfaces/Order';
import { Provider } from 'app/interfaces/Provider';
import SparePart from 'app/interfaces/SparePart';
import useRoutes from 'app/utils/useRoutes';
import { translateOrderType } from 'app/utils/utilsOrder';
import { HeaderForm } from 'components/layout/HeaderForm';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Link from 'next/link';

import { BodyOrderForm } from './BodyOrderForm';
import HeaderOrderForm from './HeaderOrderForm';
import OrderPurchase from './OrderPurchase';
import OrderPurchaseDetailItems from './OrderPurchaseDetailItems';
import ProviderInfo from './ProviderInfo';
import { generateNameHeader, mapItems } from './utilsOrder';

dayjs.extend(utc);

export interface OrderFormProps {
  isPurchase?: boolean;
  orderRequest?: Order;
  purchaseOrderId?: string;
}

export default function OrderForm({
  isPurchase,
  orderRequest,
  purchaseOrderId,
}: OrderFormProps) {
  const {
    createOrder,
    getNextCode,
    updateOrder,
    fetchOrderById,
    getOrderWithFilters,
    orders,
  } = useOrder();
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
    account: '',
    accountId: '',
  });

  const [isLoading, setIsLoading] = useState(true);

  const [orderPurchase, setOrderPurchase] = useState<OrderSimple | undefined>(
    undefined
  );

  const [selectedSparePart, setSelectedSparePart] = useState<
    SparePart | undefined
  >(undefined);
  const [selectedProvider, setSelectedProvider] = useState<
    Provider | undefined
  >(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [isSuccess, setIsSuccess] = useState<boolean | undefined>(undefined);
  const ROUTES = useRoutes();

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
          status: orderResponse.status,
          relationOrders: orderResponse.relationOrders,
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
      setIsLoading(false);
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

      setMessage(
        `${orderRequest == null ? 'Creada' : 'Actualitzada'} Correctament`
      );
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      setIsSuccess(false);
      setMessage('Error ' + error);
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
        relationOrderId: '', //orderSelected.relationOrderId,
        relationOrderCode: '', //orderSelected.relationOrderCode,
        code: orderSelected.code,
        status: orderSelected.status,
        type: orderSelected.type,
        comment: orderSelected.comment,
        date: orderSelected.date,
        active: orderSelected.active,
        operatorId: '66156dc51a7347dfd58d8ca8',
        items: mapItems(orderSelected, warehouses),
        relationOrders: orderSelected.relationOrders,
        accountId: orderSelected.accountId,
        account: orderSelected.account,
      }));
      setSelectedProvider(orderSelected.provider);
      if (
        orderSelected &&
        orderSelected.relationOrders &&
        orderSelected.relationOrders?.length > 0
      )
        handleLoadDeliveryOrders(
          orderSelected.relationOrders?.map(x => x.relationOrderId)
        );
    } else {
      if (
        orderSelected &&
        orderSelected.relationOrders &&
        orderSelected.relationOrders.length > 0
      ) {
        const orderResponse = await fetchOrderById(
          orderSelected.relationOrders[0].relationOrderId
        );
        setOrderPurchase({
          id: orderSelected.relationOrders[0].relationOrderId,
          creationDate: orderSelected.creationDate,
          active: true,
          code: orderSelected.relationOrders[0].relationOrderCode,
          providerId: orderSelected.providerId,
          items: mapItems(orderResponse, warehouses),
          status: orderResponse.status,
          type: orderResponse.type,
          comment: orderResponse.comment,
          date: orderResponse.date,
          provider: orderResponse.provider,
          relationOrders: orderResponse.relationOrders,

          //relationOrderId:'',// orderSelected.relationOrderId,
          // relationOrderCode: ''//orderSelected.relationOrderCode,
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
          relationOrders: orderSelected.relationOrders,
          accountId: orderSelected.accountId,
          account: orderSelected.account,
          relationOrderId:
            orderSelected.relationOrders != undefined
              ? orderSelected.relationOrders[0].relationOrderId
              : undefined,
          // relationOrderCode: orderSelected.relationOrders[0].relationOrderCode,
          //relationOrderId: orderSelected.relationOrderId,
          //relationOrderCode: orderSelected.relationOrderCode,
          items: mapItems(orderSelected, warehouses),
          status: orderSelected.status,
        }));
      }
    }
    setIsLoading(false);
  }

  async function handleLoadDeliveryOrders(relationOrderIds: string[]) {
    await getOrderWithFilters({
      ids: relationOrderIds,
    });
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

  function handleSelectedAccount(Account: Account) {
    if (isLoading) return;
    setOrder(prev => ({
      ...prev,
      Account: Account.code + ' - ' + Account.description,
      AccountId: Account.id,
    }));
  }

  return (
    <div className="flex flex-col h-full pb-4">
      <HeaderForm
        header={headerName}
        isCreate={orderRequest == null}
        canPrint={
          orderRequest?.type == OrderType.Purchase
            ? 'order?id=' + orderRequest?.id
            : undefined
        }
      />
      <div className="bg-white p-4 rounded-lg shadow-md flex-grow flex flex-col space-y-4 h-full">
        {!isLoading && (
          <HeaderOrderForm
            order={order}
            setOrder={setOrder}
            handleChangeProvider={handleChangeProvider}
            loadOrderFromScratch={handleLoadOrderFromScratch}
            isEditing={orderRequest != null}
            disabledSearchPurchaseOrder={purchaseOrderId != null}
            setSelectedAccount={handleSelectedAccount}
          />
        )}

        {orders && orders.length > 0 && (
          <div className="flex flex-col border p-2 rounded-md bg-gray-100 text-gray-700 font-semibold">
            {orders.map(x => (
              <>
                <Link
                  href={ROUTES.orders.order + '/' + x.id}
                  className="text-blue-500 hover:underline"
                >
                  {translateOrderType(
                    order.type == OrderType.Purchase
                      ? OrderType.Delivery
                      : OrderType.Purchase
                  )}
                  {' - '} {x.code}
                </Link>
                <OrderPurchaseDetailItems
                  handleRecieveItem={() => {}}
                  items={x.items}
                  isOrderPurchase={false}
                  showActionButtons={false}
                />
              </>
            ))}
          </div>
        )}

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
          <div className="flex flex-col  p-4 border-t border-b my-4 px-16">
            <div className="flex flex-row justify-between">
              <div className="font-bold">Total:</div>
              <div className="font-bold">
                {order.items
                  .reduce(
                    (acc, item) =>
                      acc +
                      Number(item.unitPrice) *
                        item.quantity *
                        (1 - item.discount / 100),
                    0
                  )
                  .toFixed(2)}
                €
              </div>
            </div>
            <div className="flex flex-row justify-between">
              <div className="font-bold">Total (IVA Inclòs):</div>
              <div className="font-bold">
                {(
                  order.items.reduce(
                    (acc, item) =>
                      acc +
                      Number(item.unitPrice) *
                        item.quantity *
                        (1 - item.discount / 100),
                    0
                  ) * 1.21
                ).toFixed(2)}
                €
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <button
              onClick={handleCreateOrder}
              className={`w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600 ${
                order.items.length == 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={order.items.length == 0}
            >
              {orderRequest == null ? headerName : 'Actualitzar'}
            </button>
            {order.type == OrderType.Purchase &&
              orderRequest?.status != OrderStatus.Completed &&
              orderRequest?.id !== undefined && (
                <Link
                  href={
                    ROUTES.orders.order +
                    '/orderForm?purchaseOrderId=' +
                    orderRequest?.id
                  }
                  className="w-full bg-okron-btCreate text-white p-2 rounded-md hover:bg-okron-btCreateHover text-center"
                >
                  Crear Albarà
                </Link>
              )}
          </div>
          {message && (
            <div
              className={`w-full p-2 mt-2 rounded-md font-semibold ${
                isSuccess ? 'bg-green-200' : 'bg-red-200'
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
