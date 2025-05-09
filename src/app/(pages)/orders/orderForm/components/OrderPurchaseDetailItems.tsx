import { OrderItemRequest } from 'app/interfaces/Order';

interface OrderPurchaseDetailItemsProps {
  items: OrderItemRequest[];
  handleRecieveItem: (
    orderItem: OrderItemRequest,
    isPartial: boolean,
    all?: boolean
  ) => void;
  isOrderPurchase: boolean;
}

export default function OrderPurchaseDetailItems({
  items,
  handleRecieveItem,
  isOrderPurchase,
}: OrderPurchaseDetailItemsProps) {
  const disableReceiveAll = items.some(x => x.quantityPendient ?? 0 > 0);
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
              <th className="p-2 border w-1/10">
                {isOrderPurchase ? 'Quantitat Sol·licitada' : 'Quantitat'}
              </th>
              {isOrderPurchase && (
                <th className="p-2 border w-1/10">Quantitat Pendent</th>
              )}
              <th className="p-2 border w-1/10">Preu Unitari</th>
              <th className="p-2 border w-1/10">Total</th>
              <th className="p-2 border w-1/10">Acció</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const isDisabled = item.quantityPendient == 0;
              return (
                <tr key={index} className="border-t">
                  <td className="p-2 border">
                    {item.sparePart.code} - {item.sparePart.description}
                  </td>
                  <td className="p-2 border text-center">
                    {item.wareHouse?.description}
                  </td>
                  <td className="p-2 border text-center">{item.quantity}</td>
                  {isOrderPurchase && (
                    <td className="p-2 border text-center">
                      {item.quantityPendient}
                    </td>
                  )}
                  <td className="p-2 border text-center">{item.unitPrice}€</td>
                  <td className="p-2 border text-center">
                    {item.discount > 0 ? (
                      <span>
                        {(
                          item.quantity *
                          Number(item.unitPrice) *
                          (1 - item.discount / 100)
                        ).toFixed(2)}
                        €
                      </span>
                    ) : (
                      <span>
                        {(item.quantity * Number(item.unitPrice)).toFixed(2)}€
                      </span>
                    )}
                  </td>
                  <td className="border p-2 text-center">
                    {isOrderPurchase ? (
                      <div className="flex flex-row gap-2 items-center">
                        <button
                          className={`flex w-full bg-blue-500 justify-center text-white px-2 py-1 rounded-md hover:bg-blue-600 ${
                            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => handleRecieveItem(item, false)}
                          disabled={isDisabled}
                        >
                          +
                        </button>
                        <button
                          className={`flex w-full bg-orange-500 justify-center text-white px-2 py-1 rounded-md hover:bg-orange-600 ${
                            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => handleRecieveItem(item, true)}
                          disabled={isDisabled}
                        >
                          Parcial
                        </button>
                      </div>
                    ) : (
                      <button
                        className="flex w-full bg-red-500 justify-center text-white px-2 py-1 rounded-md hover:bg-red-600"
                        onClick={() => handleRecieveItem(item, false)}
                        disabled={isDisabled}
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
      {isOrderPurchase && (
        <div className="my-4 flex justify-end">
          <button
            className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 ${
              !disableReceiveAll && 'opacity-50 cursor-not-allowed'
            }`}
            onClick={() => handleRecieveItem(items[0], false, true)}
            disabled={!disableReceiveAll}
          >
            Recepcionar comanada sencera
          </button>
        </div>
      )}
    </div>
  );
}
