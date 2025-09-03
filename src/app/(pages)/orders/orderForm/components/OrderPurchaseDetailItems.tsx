import { OrderItemRequest } from 'app/interfaces/Order';

interface OrderPurchaseDetailItemsProps {
  items: OrderItemRequest[];
  handleRecieveItem: (
    orderItem: OrderItemRequest,
    isPartial: boolean,
    all?: boolean
  ) => void;
  isOrderPurchase: boolean;
  showActionButtons?: boolean;
}

export default function OrderPurchaseDetailItems({
  items,
  handleRecieveItem,
  isOrderPurchase,
  showActionButtons = true,
}: OrderPurchaseDetailItemsProps) {
  const disableReceiveAll = items.some(x => x.quantityPendient ?? 0 > 0);
  return (
    <div>
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold">
          {isOrderPurchase ? 'Llista de Recanvis' : 'Recepció'}
        </h3>
        <table className="w-full border border-gray-300 mt-2 ">
          <thead>
            <tr className="bg-gray-100 text-center">
              <th className="p-2 border w-[5%]">Nº</th>
              <th
                className={`p-2 border ${
                  showActionButtons ? 'w-[30%]' : 'w-[25%]'
                }`}
              >
                Recanvi
              </th>
              <th className="p-2 border w-[15%]">Magatzem</th>
              <th className="p-2 border w-[15%]">Ref. Proveeïdor</th>
              <th className="p-2 border w-[15%]">
                {isOrderPurchase ? 'Quantitat Sol·licitada' : 'Quantitat'}
              </th>
              {isOrderPurchase && (
                <th className="p-2 border w-[10%]">Quantitat Pend.</th>
              )}
              <th className="p-2 border w-[10%]">Preu Unitari</th>
              <th
                className={`p-2 ${
                  showActionButtons ? 'w-[10%]' : 'w-[20%]'
                } border `}
              >
                Total
              </th>
              {showActionButtons && (
                <th className="p-2 border w-[10%]">Acció</th>
              )}
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => {
              const isDisabled = item.quantityPendient == 0;

              const sparePartCode = item.sparePartName
                ? item.sparePartName?.split('-')[0]
                : item.sparePart
                ? item.sparePart.code
                : '';
              const sparePartName = item.sparePartName
                ? item.sparePartName?.split('-')[1]
                : item.sparePart
                ? item.sparePart.description
                : '';

              return (
                <tr key={index} className="border-t text-sm">
                  <td className="p-2 border text-center  w-[5%]">
                    {index + 1}
                  </td>
                  <td className="p-2 border w-[35%] whitespace-nowrap overflow-hidden text-ellipsis">
                    {sparePartCode} - {sparePartName}
                  </td>
                  <td className="p-2 border text-center w-[15%]">
                    {item.wareHouseName ?? item.wareHouse?.description}
                  </td>
                  <td className="p-2 border text-center w-[15%]">
                    {item.refProvider}
                  </td>
                  <td className="p-2 border text-center w-[15%]">
                    {item.quantity}
                  </td>

                  {isOrderPurchase && (
                    <td className="p-2 border text-center w-[10%]">
                      {item.quantityPendient}
                    </td>
                  )}

                  <td className="p-2 border text-center w-[10%]">
                    {item.unitPrice}€
                  </td>

                  <td className="p-2 border text-center w-[10%]">
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

                  {showActionButtons && (
                    <td className="p-2 border text-center w-[10%]">
                      {isOrderPurchase ? (
                        <div className="flex gap-2">
                          <button
                            className={`flex-1 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 ${
                              isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={() => handleRecieveItem(item, false)}
                            disabled={isDisabled}
                          >
                            +
                          </button>
                          <button
                            className={`flex-1 bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600 ${
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
                          className="w-full bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          onClick={() => handleRecieveItem(item, false)}
                          disabled={isDisabled}
                        >
                          Retornar
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {isOrderPurchase && showActionButtons && (
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
