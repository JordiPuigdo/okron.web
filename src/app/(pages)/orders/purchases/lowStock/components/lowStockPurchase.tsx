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
  const [selectAll, setSelectAll] = useState(false);
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

  const [search, setSearch] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (selectAll) {
      const allProviderIds = lowStockOrders.map(order => order.providerId);
      setSelectedOrders(new Set(allProviderIds));
    } else {
      setSelectedOrders(new Set());
    }
  }, [selectAll, lowStockOrders]);

  const filteredOrders = lowStockOrders.filter(order =>
    order.providerName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrders(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(orderId)) {
        newSelected.delete(orderId);
      } else {
        newSelected.add(orderId);
      }
      return newSelected;
    });
  };

  return (
    <div className="flex flex-col flex-1 bg-white shadow-lg rounded-xl">
      {/* Fixed header */}
      <div className="flex-none p-4 border-b border-gray-200">
        <div className="flex flex-row items-center gap-6 bg-white rounded-lg">
          {/* Select All Section */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => setSelectAll(prev => !prev)}
          >
            <input
              type="checkbox"
              checked={selectAll}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-colors"
            />
            <label className="text-gray-700 font-medium cursor-pointer">
              Seleccionar Tots
            </label>
          </div>

          {/* Search Section */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Buscar per proveidor"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        <div className="p-4">
          {filteredOrders.map(order => {
            const totalPrice = order.items.reduce(
              (sum, item) => sum + Number(item.unitPrice) * item.quantity,
              0
            );

            return (
              <div key={order.id} className="mb-6 last:mb-0 ">
                <div className="flex flex-row gap-2 items-center p-1 py-1">
                  <input
                    type="checkbox"
                    checked={selectedOrders.has(order.providerId)}
                    onChange={() => handleOrderSelect(order.providerId)}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <h2
                    className="text-lg font-semibold text-gray-800 hover:cursor-pointer"
                    onClick={() => handleOrderSelect(order.providerId)}
                  >
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
                      className={`grid grid-cols-3 gap-4 py-2  ${
                        Number(item.unitPrice) <= 0
                          ? 'border-red-500 border-2 rounded'
                          : ' border-gray-200 last:border-b-0  border-b'
                      }`}
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
      </div>

      <div className="flex-none border-t border-gray-200 p-4 bg-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-lg font-semibold text-gray-700">
              {selectedOrders.size} elements seleccionats
            </span>
          </div>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={() => setSelectedOrders(new Set())}
            >
              Cancel·lar
            </Button>
            <Button disabled={selectedOrders.size === 0}>Generar Compra</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
