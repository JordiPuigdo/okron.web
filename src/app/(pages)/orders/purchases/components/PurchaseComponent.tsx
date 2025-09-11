'use client';

import { OrderType } from 'app/interfaces/Order';
import { useTranslations } from 'app/hooks/useTranslations';
import { HeaderTable } from 'components/layout/HeaderTable';

import { TableDataOrders } from '../../components/TableDataOrders';

export default function PurchaseComponent() {
  const { t } = useTranslations();
  
  return (
    <div className="flex flex-col h-full">
      <HeaderTable
        title={t('order')}
        subtitle={`${t('start')} - ${t('orders.list')}`}
        createButton={t('create.order')}
        urlCreateButton="/orders/orderForm?isPurchase=true"
      />
      <TableDataOrders
        orderType={OrderType.Purchase}
        className="bg-white p-4 rounded-xl shadow-md"
      />
    </div>
  );
}
