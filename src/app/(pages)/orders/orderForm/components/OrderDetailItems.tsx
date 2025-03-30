import { useEffect, useState } from 'react';
import { EditableCell } from 'app/(pages)/machines/downtimes/components/EditingCell';
import { useProviders } from 'app/hooks/useProviders';
import { OrderItemRequest } from 'app/interfaces/Order';

interface OrderDetailItemsProps {
  items: OrderItemRequest[];
  handleRemoveItem: (index: number) => void;
  canEdit: boolean;
  onChangePrice: (items: OrderItemRequest[]) => void;
  onChangeEstimatedDeliveryDate: (items: OrderItemRequest[]) => void;
  onChangeQuantity: (items: OrderItemRequest[]) => void;
  onChangeDiscount: (items: OrderItemRequest[]) => void;
}

export default function OrderDetailItems({
  items,
  handleRemoveItem,
  canEdit,
  onChangePrice,
  onChangeEstimatedDeliveryDate,
  onChangeQuantity,
  onChangeDiscount,
}: OrderDetailItemsProps) {
  const [itemsDetail, setItemsDetail] = useState<OrderItemRequest[]>(items);
  const { updateSparePartPrice, updateSparePartDiscount } = useProviders();

  function handleUpdateEstimatedDeliveryDate(
    item: OrderItemRequest,
    date: string
  ) {
    const newItems = itemsDetail.map(x => {
      if (x.sparePartId === item.sparePartId) {
        return { ...x, estimatedDeliveryDate: date };
      }
      return x;
    });
    setItemsDetail(newItems);
    onChangeEstimatedDeliveryDate(newItems);
  }

  function handleUpdatePrice(item: OrderItemRequest, price: string) {
    if (item.unitPrice !== price) {
      updateSparePartPrice({
        providerId: item.provider!.id,
        sparePartId: item.sparePartId,
        price: price,
      });
      const newItems = itemsDetail.map(x => {
        if (x.sparePartId === item.sparePartId) {
          return { ...x, unitPrice: price };
        }
        return x;
      });
      setItemsDetail(newItems);
      onChangePrice(newItems);
    }
  }

  useEffect(() => {
    setItemsDetail(items);
  }, [items]);

  function handleUpdateQuantity(item: OrderItemRequest, quantity: string) {
    const newItems = itemsDetail.map(x => {
      if (x.sparePartId === item.sparePartId) {
        return { ...x, quantity: Number(quantity) };
      }
      return x;
    });
    setItemsDetail(newItems);
    onChangeQuantity(newItems);
  }

  async function handleUpdateDiscount(
    item: OrderItemRequest,
    discount: string
  ) {
    await updateSparePartDiscount({
      providerId: item.provider!.id,
      sparePartId: item.sparePartId,
      discount: Number(discount),
    });
    const newItems = itemsDetail.map(x => {
      if (x.sparePartId === item.sparePartId) {
        return { ...x, discount: Number(discount) };
      }
      return x;
    });
    setItemsDetail(newItems);
    onChangeDiscount(newItems);
  }

  const calculateItemTotal = (item: OrderItemRequest) => {
    return item.quantity * Number(item.unitPrice) * (1 - item.discount / 100);
  };

  return (
    <div>
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold">Llista de Recanvis</h3>
        <table className="w-full border border-gray-300 mt-2">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border w-2/6">Recanvi</th>
              <th className="p-2 border w-1/10">Magatzem</th>
              <th className="p-2 border w-1/10">Referencia Proveidor</th>
              <th className="p-2 border w-1/10">Quantitat</th>
              <th className="p-2 border w-1/10">Data Estimada</th>
              <th className="p-2 border w-1/10">Preu Unitari</th>
              <th className="p-2 border w-1/12">Desc. %</th>
              <th className="p-2 border w-1/10">Total</th>
              <th className="p-2 border w-1/10">Acció</th>
            </tr>
          </thead>
          <tbody>
            {itemsDetail.map((item, index) => {
              return (
                <tr key={index} className="border-t">
                  <td className="p-2 border">
                    {item.sparePart.code || 'Unknown'} -{' '}
                    {item.sparePart.description.substring(0, 50)}
                    {item.sparePart.description.length > 20 && '...'}
                  </td>
                  <td className="p-2 border text-center">
                    {item.wareHouse?.description}
                  </td>
                  <td className="p-2 border text-center">{item.refProvider}</td>
                  <td className="p-2 border text-center">
                    <EditableCell
                      value={item.quantity.toString()}
                      onUpdate={newValue =>
                        handleUpdateQuantity(item, newValue)
                      }
                      canEdit={canEdit}
                    />
                  </td>
                  <td className="p-2 border text-center">
                    <EditableCell
                      value={item.estimatedDeliveryDate ?? ''}
                      onUpdate={newValue =>
                        handleUpdateEstimatedDeliveryDate(item, newValue)
                      }
                      canEdit={canEdit}
                      type="date"
                    />
                  </td>
                  <td className=" justify-center gap-2">
                    <div className="flex flex-row gap-2 items-center justify-center">
                      <EditableCell
                        value={item.unitPrice}
                        onUpdate={newValue => handleUpdatePrice(item, newValue)}
                        canEdit={canEdit}
                      />
                      <span>€</span>
                    </div>
                  </td>
                  <td className="p-2 border text-center">
                    <EditableCell
                      value={item.discount.toString()}
                      onUpdate={newValue =>
                        handleUpdateDiscount(item, newValue)
                      }
                      canEdit={canEdit}
                    />
                  </td>
                  <td className="p-2 border text-center">
                    {calculateItemTotal(item).toFixed(2)}€
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className={`flex w-full justify-center text-white px-2 py-1 rounded-md ${
                        !canEdit
                          ? 'bg-gray-300 '
                          : 'bg-red-500  hover:bg-red-600'
                      }`}
                      disabled={!canEdit}
                    >
                      Eliminar
                    </button>
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
