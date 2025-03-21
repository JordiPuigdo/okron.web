'use client';
import { useEffect, useState } from 'react';
import { useOrder } from 'app/hooks/useOrder';
import { Order } from 'app/interfaces/Order';
import { Button } from 'designSystem/Button/Buttons';

export default function LowStockPurchase() {
  const { fetchLowStockOrders } = useOrder();
  const [lowStockOrders, setLowStockOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProviderId, setExpandedProviderId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const orders = await fetchLowStockOrders();
        setLowStockOrders(orders);
      } catch (err) {
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);
  return (
    <div className="flex flex-col bg-white shadow-lg rounded-xl p-6 flex-1 overflow-y-auto">
      <div className="flex flex-row gap-2 items-center p-1 py-4">
        <span>SeleccionarTots</span>
        <span>Buscar per proveidor</span>
      </div>
      <div className="flex flex-col">
        {lowStockOrders.map(order => {
          // Calculate the total price for the provider
          const totalPrice = order.items.reduce(
            (sum, item) => sum + Number(item.unitPrice) * item.quantity,
            0
          );

          return (
            <div key={order.id} className="mb-6 last:mb-0 ">
              <div className="flex flex-row gap-2 items-center p-1 py-1">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <h2 className="text-lg font-semibold text-gray-800">
                  {order.providerName}
                </h2>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4 mb-3 font-semibold text-gray-500 border-b border-gray-200">
                  <span>Rencavi</span>
                  <span>Unitats</span>
                  <span className="text-right mr-6">Preu</span>
                </div>
                {order.items.map(item => (
                  <div
                    key={item.id}
                    className="grid grid-cols-3 gap-4 py-2 border-b last:border-b-0 border-gray-200"
                  >
                    <span className="text-gray-600">
                      {item.sparePart.description}
                    </span>
                    <span className="text-gray-600">{item.quantity}</span>
                    <span className="text-gray-600 text-right mr-6">
                      {item.unitPrice} €
                    </span>
                  </div>
                ))}
              </div>
              {/* Total price displayed below the items */}
              <div className="mt-4 text-right">
                <span className="text-lg font-semibold text-blue-600 mr-3">
                  Total: {totalPrice.toFixed(2)} €
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex mt-auto relative bottom-0">
        <Button>Generar Compra</Button>
      </div>
    </div>
  );
}
