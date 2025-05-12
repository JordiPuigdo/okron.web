import { OrderType } from 'app/interfaces/Order';
import { HeaderTable } from 'components/layout/HeaderTable';

import { TableDataOrders } from '../../components/TableDataOrders';

export default function PurchaseComponent() {
  return (
    <div className="flex flex-col h-full">
      <HeaderTable
        title="Comanda"
        subtitle="Inici - Llistat de Comandes"
        createButton="Crear Comanda"
        urlCreateButton="/orders/orderForm?isPurchase=true"
      />
      <TableDataOrders
        orderType={OrderType.Purchase}
        className="bg-white p-4 rounded-xl shadow-md"
      />
    </div>
  );
}
