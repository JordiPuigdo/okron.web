import { useState } from 'react';
import { Order } from 'app/interfaces/Order';
import useRoutes from 'app/utils/useRoutes';
import { Input } from 'components/ui/input';
import dayjs from 'dayjs';
import { CircleArrowUp, Plus, PlusCircle, Search, Truck } from 'lucide-react';
import Link from 'next/link';

import OrderPurchaseDetailItems from './OrderPurchaseDetailItems';

interface Props {
  deliveryOrders: Order[];
}

export default function DeliveryOrders({ deliveryOrders }: Props) {
  const ROUTES = useRoutes();
  const [searchTerm, setSearchTerm] = useState('');

  const [isExpanded, setIsExpanded] = useState<string | undefined>(undefined);

  if (!deliveryOrders || deliveryOrders.length === 0) return null;
  const filteredOrders = deliveryOrders.filter(order => {
    const matchesSearch =
      order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryProviderCode
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const RenderExpan = (id: string) => {
    return (
      <div>
        {isExpanded == id ? (
          <>
            <CircleArrowUp
              className={`h-6 w-6 text-muted-foreground hover:cursor-pointer`}
              onClick={() => setIsExpanded(isExpanded === id ? undefined : id)}
            />
          </>
        ) : (
          <>
            <PlusCircle
              className={`h-6 w-6 text-muted-foreground hover:cursor-pointer `}
              onClick={() => setIsExpanded(isExpanded === id ? undefined : id)}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col border rounded-md p-4 ">
      <div className="w-full p-2 flex gap-4 items-center">
        <Truck className="h-6 w-6" />
        <span className="text-xl font-semibold">Albarans de recepció</span>
        <span className="text-muted-foreground text-sm font-normal">
          ({deliveryOrders.length})
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar per codi o albarà..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="w-full p-2 flex flex-col gap-4 items-center mt-4">
        {filteredOrders.map(x => (
          <div key={x.id} className="w-full ">
            <div className="flex gap-4">
              {RenderExpan(x.id)}
              <Link
                href={ROUTES.orders.order + '/' + x.id}
                className="text-blue-500 hover:underline font-semibold"
              >
                {x.code} - {x.deliveryProviderCode} -{' '}
                {dayjs(x.date).format('DD/MM/YYYY')}
              </Link>
            </div>
            {isExpanded === x.id && (
              <div className="mt-2 w-full rounded-xl p-2 bg-gray-50/80">
                <OrderPurchaseDetailItems
                  handleRecieveItem={() => {}}
                  items={x.items}
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
