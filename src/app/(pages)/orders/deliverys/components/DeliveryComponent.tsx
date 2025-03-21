import { OrderType } from 'app/interfaces/Order';
import { HeaderTable } from 'components/layout/HeaderTable';

import { TableDataOrders } from '../../components/TableDataOrders';

export default function DeliveryComponent() {
  return (
    <div className="flex flex-col h-full">
      <HeaderTable
        title="Recepció"
        subtitle="Inici - Llistat de Recepcions"
        createButton="Crear Recepció"
        urlCreateButton="/orders/orderForm"
      />
      <TableDataOrders orderType={OrderType.Delivery} />
    </div>
  );
}
