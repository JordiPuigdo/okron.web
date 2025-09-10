import { OrderType } from 'app/interfaces/Order';
import { HeaderTable } from 'components/layout/HeaderTable';

import { useTranslations } from '../../../../hooks/useTranslations';
import { TableDataOrders } from '../../components/TableDataOrders';

export default function DeliveryComponent() {
  const {t} = useTranslations();
  return (
    <div className="flex flex-col h-full">
      <HeaderTable
        title="Recepció"
        subtitle={`${t('start')} - Llistat de Recepcions`}
        createButton="Crear Recepció"
        urlCreateButton="/orders/orderForm"
      />
      <TableDataOrders
        orderType={OrderType.Delivery}
        className="bg-white p-4 rounded-xl shadow-md"
      />
    </div>
  );
}
