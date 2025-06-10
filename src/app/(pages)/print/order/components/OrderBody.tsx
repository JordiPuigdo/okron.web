import { Order, OrderItemRequest } from 'app/interfaces/Order';

export const OrderBody = ({ order }: { order: Order }) => {
  const calculateItemTotal = (item: OrderItemRequest) => {
    return item.quantity * Number(item.unitPrice) * (1 - item.discount / 100);
  };
  return (
    <table className="w-full border border-gray-300 mt-2">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2 border w-2/6">Recanvi</th>
          <th className="p-2 border w-1/10">Referencia</th>
          <th className="p-2 border w-1/10">Quantitat</th>
          <th className="p-2 border w-1/10">Preu</th>
          <th className="p-2 border w-1/12">% Dte</th>
          <th className="p-2 border w-1/10">Import</th>
        </tr>
      </thead>
      <tbody>
        {order.items.map((item, index) => {
          return (
            <tr key={index} className="border-t">
              <td className="p-2 border">
                {item.sparePart.code || 'Unknown'} -{' '}
                {item.sparePart.description}
              </td>
              <td className="p-2 border text-center">{item.refProvider}</td>
              <td className="p-2 border text-center">
                {item.quantity.toString()}
              </td>

              <td className=" justify-center gap-2">
                <div className="flex flex-row gap-2 items-center justify-center">
                  {item.unitPrice}
                  <span>€</span>
                </div>
              </td>
              <td className="p-2 border text-center">
                {item.discount.toString()}
              </td>
              <td className="p-2 border text-center">
                {calculateItemTotal(item).toFixed(2)}€
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
