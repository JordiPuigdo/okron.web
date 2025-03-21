import { OrderItemRequest } from 'app/interfaces/Order';

interface OrderPurchaseDetailItemsProps {
  items: OrderItemRequest[];
  handleRecieveItem: (orderItem: OrderItemRequest) => void;
  isOrderPurchase: boolean;
}

export default function OrderPurchaseDetailItems({
  items,
  handleRecieveItem,
  isOrderPurchase,
}: OrderPurchaseDetailItemsProps) {
  return (
    <div>
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold">
          {isOrderPurchase ? 'Llista de Recanvis' : 'Recepció'}
        </h3>
        <table className="w-full border border-gray-300 mt-2">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border w-2/5">Recanvi</th>
              <th className="p-2 border w-1/5">Magatzem</th>
              <th className="p-2 border w-1/10">Quantitat</th>
              <th className="p-2 border w-1/10">Preu Unitari</th>
              <th className="p-2 border w-1/10">Total</th>
              <th className="p-2 border w-1/10">Acció</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              return (
                <tr key={index} className="border-t">
                  <td className="p-2 border">
                    {item.sparePart.code || 'Unknown'}
                  </td>
                  <td className="p-2 border text-center">
                    {item.wareHouse?.description}
                  </td>
                  <td className="p-2 border text-center">{item.quantity}</td>
                  <td className="p-2 border text-center">{item.unitPrice}€</td>
                  <td className="p-2 border text-center">
                    {(item.quantity * Number(item.unitPrice)).toFixed(2)}€
                  </td>
                  <td className="border p-2 text-center">
                    {isOrderPurchase ? (
                      <button
                        className="flex w-full bg-red-500 justify-center text-white px-2 py-1 rounded-md hover:bg-red-600"
                        onClick={() => handleRecieveItem(item)}
                      >
                        Recepcionar
                      </button>
                    ) : (
                      <button
                        className="flex w-full bg-red-500 justify-center text-white px-2 py-1 rounded-md hover:bg-red-600"
                        onClick={() => handleRecieveItem(item)}
                      >
                        Retornar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
