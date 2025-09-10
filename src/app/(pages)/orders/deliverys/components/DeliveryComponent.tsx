'use client';

import { OrderType } from 'app/interfaces/Order';
import { HeaderTable } from 'components/layout/HeaderTable';

import { useTranslations } from '../../../../hooks/useTranslations';
import { TableDataOrders } from '../../components/TableDataOrders';

export default function DeliveryComponent() {
  const {t} = useTranslations();
  return (
    <div className="flex flex-col h-full">
      <HeaderTable
        title={t('reception')}
        subtitle={`${t('start')} - ${t('reception.list')}`}
        createButton={t('create.reception')}
        urlCreateButton="/orders/orderForm"
      />
      <TableDataOrders
        orderType={OrderType.Delivery}
        className="bg-white p-4 rounded-xl shadow-md"
      />
    </div>
  );
}
