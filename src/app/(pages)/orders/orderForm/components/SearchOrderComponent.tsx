import { useEffect, useState } from 'react';
import { useOrder } from 'app/hooks/useOrder';
import { Order } from 'app/interfaces/Order';

interface SearchOrderComponentProps {
  onSelectedOrder(order: Order): void;
}

export default function SearchOrderComponent({
  onSelectedOrder,
}: SearchOrderComponentProps) {
  const { getPendingOrders } = useOrder();
  const [searchOrder, setSearchOrder] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>();
  const [orders, setOrders] = useState<Order[] | undefined>();

  async function fetch() {
    const responseData = await getPendingOrders();
    setOrders(responseData);
  }

  useEffect(() => {
    fetch();
  }, []);

  const filteredOrders = orders?.filter(order => {
    return order.code
      .toLocaleUpperCase()
      .includes(searchOrder.toLocaleUpperCase());
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selected = orders?.find(sp => sp.id === selectedId);
    if (selected) {
      setSelectedOrder(selected);
      setSearchOrder('');
      onSelectedOrder(selected);
    }
  };
  return (
    <div>
      <input
        type="text"
        className="w-full p-2 border rounded-md mb-2"
        placeholder="Buscar Compra..."
        value={searchOrder}
        onChange={e => {
          setSearchOrder(e.target.value);
        }}
        onFocus={() => setSearchOrder('')}
      />
      {searchOrder && (
        <div className="absolute w-full mt-1 bg-white border rounded-md z-10 shadow-md">
          <select
            className="w-1/2 p-2 border rounded-md"
            onChange={handleChange}
            value={selectedOrder?.id || ''}
            size={5}
          >
            <option value="">Selecciona una compra</option>
            {filteredOrders?.map(sp => (
              <option key={sp.id} value={sp.id}>
                {sp.code}
              </option>
            ))}
          </select>
        </div>
      )}
      {selectedOrder && (
        <div>
          {selectedOrder.code} - {selectedOrder.providerId}
        </div>
      )}
    </div>
  );
}
