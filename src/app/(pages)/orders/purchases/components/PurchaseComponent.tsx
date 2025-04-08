import { OrderType } from 'app/interfaces/Order';
import { HeaderTable } from 'components/layout/HeaderTable';

import { TableDataOrders } from '../../components/TableDataOrders';

export default function PurchaseComponent() {
  return (
    <div className="flex flex-col h-full">
      <HeaderTable
        title="Compra"
        subtitle="Inici - Llistat de Compres"
        createButton="Crear Compra"
        urlCreateButton="/orders/orderForm?isPurchase=true"
      />
      <TableDataOrders
        orderType={OrderType.Purchase}
        className="bg-white p-4 rounded-xl shadow-md"
      />
    </div>
  );
}
