import { DeliveryNote } from 'app/interfaces/DeliveryNote';

export const DeliveryNoteBody = ({ deliveryNote }: { deliveryNote: DeliveryNote }) => {
  return (
    <table className="w-full border border-gray-300 mt-6">
      <thead>
      <tr className="bg-gray-100">
        <th className="p-2 border w-1/2">Descripció</th>
        <th className="p-2 border w-1/10">Quantitat</th>
        <th className="p-2 border w-1/10">Preu Unitari</th>
        <th className="p-2 border w-1/12">% Dte</th>
        <th className="p-2 border w-1/10">Import</th>
      </tr>
      </thead>
      <tbody>
      {deliveryNote.items.map((item, index) => (
        <tr key={index} className="border-t">
          <td className="p-2 border">
            {item.description}
            {item.workOrderId && (
              <div className="text-xs text-gray-500 mt-1">
                OT: {item.workOrderId}
              </div>
            )}
          </td>
          <td className="p-2 border text-center">
            {item.quantity}
          </td>
          <td className="p-2 border text-center">
            {item.unitPrice.toFixed(2)}€
          </td>
          <td className="p-2 border text-center">
            {item.discountPercentage}%
          </td>
          <td className="p-2 border text-center">
            {item.lineTotal.toFixed(2)}€
          </td>
        </tr>
      ))}
      </tbody>
    </table>
  );
};