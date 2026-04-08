import { useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { Order, ReturnOrder } from 'app/interfaces/Order';
import { orderService } from 'app/services/orderService';
import useRoutes from 'app/utils/useRoutes';
import { Input } from 'components/ui/input';
import dayjs from 'dayjs';
import { CircleArrowUp, PlusCircle, ReceiptText, Search } from 'lucide-react';
import Link from 'next/link';

import OrderPurchaseDetailItems from './OrderPurchaseDetailItems';

interface Props {
  returnOrders: ReturnOrder[];
}

export default function ReturnOrders({ returnOrders }: Props) {
  const { t } = useTranslations();
  const ROUTES = useRoutes();
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState<string | undefined>(undefined);
  const [expandedOrderData, setExpandedOrderData] = useState<
    Record<string, Order>
  >({});

  if (!returnOrders || returnOrders.length === 0) return null;

  const filteredOrders = returnOrders.filter(order => {
    const matchesSearch =
      order.returnOrderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryOrderCode?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleExpand = async (returnOrder: ReturnOrder) => {
    const orderId = returnOrder.returnOrderId;
    
    if (isExpanded === orderId) {
      setIsExpanded(undefined);
      return;
    }

    setIsExpanded(orderId);

    // Si ya tenemos los datos, no hacer fetch de nuevo
    if (expandedOrderData[orderId]) return;

    try {
      const orderData = await orderService.getById(orderId);
      setExpandedOrderData(prev => ({
        ...prev,
        [orderId]: orderData,
      }));
    } catch (error) {
      console.error('Error fetching return order details:', error);
    }
  };

  const RenderExpand = (returnOrder: ReturnOrder) => {
    const orderId = returnOrder.returnOrderId;
    return (
      <div>
        {isExpanded === orderId ? (
          <CircleArrowUp
            className="h-6 w-6 text-muted-foreground hover:cursor-pointer"
            onClick={() => handleExpand(returnOrder)}
          />
        ) : (
          <PlusCircle
            className="h-6 w-6 text-muted-foreground hover:cursor-pointer"
            onClick={() => handleExpand(returnOrder)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col border rounded-md p-4">
      <div className="w-full p-2 flex gap-4 items-center">
        <ReceiptText className="h-6 w-6 text-orange-600" />
        <span className="text-xl font-semibold">{t('order.returns')}</span>
        <span className="text-muted-foreground text-sm font-normal">
          ({returnOrders.length})
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('order.search.return.or.delivery')}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="w-full p-2 flex flex-col gap-4 items-center mt-4">
        {filteredOrders.map(returnOrder => (
          <div key={returnOrder.id} className="w-full">
            <div className="flex gap-4 items-center">
              {RenderExpand(returnOrder)}
              <Link
                href={ROUTES.orders.order + '/' + returnOrder.returnOrderId}
                className="text-orange-600 hover:underline font-semibold"
              >
                {returnOrder.returnOrderCode}
              </Link>
              <span className="text-muted-foreground text-sm">
                {dayjs(returnOrder.date).format('DD/MM/YYYY')}
              </span>
              <span className="font-medium text-orange-700">
                {returnOrder.totalAmount.toFixed(2)}€
              </span>
              <span className="text-muted-foreground text-sm">
                → {t('order.delivery')}: {returnOrder.deliveryOrderCode}
              </span>
            </div>

            {isExpanded === returnOrder.returnOrderId &&
              expandedOrderData[returnOrder.returnOrderId] && (
                <div className="mt-2 w-full rounded-xl p-2 bg-orange-50/50">
                  <OrderPurchaseDetailItems
                    handleRecieveItem={() => {}}
                    items={expandedOrderData[returnOrder.returnOrderId].items}
                    isOrderPurchase={false}
                    showActionButtons={false}
                  />
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
