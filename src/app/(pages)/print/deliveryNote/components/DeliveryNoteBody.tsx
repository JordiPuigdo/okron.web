import { DeliveryNote } from 'app/interfaces/DeliveryNote';
import { formatEuropeanCurrency } from 'app/utils/utils';
import dayjs from 'dayjs';

export const DeliveryNoteBody = ({
  deliveryNote,
}: {
  deliveryNote: DeliveryNote;
}) => {
  return (
    <div className="mt-6 space-y-6">
      {deliveryNote.workOrders.map((workOrder, workOrderIndex) => (
        <div key={workOrderIndex} className="border border-gray-300 rounded">
          {/* Work Order Header */}
          <div className="bg-gray-100 p-3 border-b border-gray-300">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">
                {dayjs(workOrder.workOrderStartTime).format('DD/MM/YYYY')}
                {workOrder.workOrderRefId !== null
                  ? ', OT ' + workOrder.workOrderRefId
                  : ''}
              </h3>
            </div>
            <p className="text-sm mt-1">
              {workOrder.concept}{' '}
              {deliveryNote.installation?.code
                ? ', ' + deliveryNote.installation?.code
                : ''}
            </p>
          </div>

          {/* Items Table */}
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-300">
                <th className="p-2 text-left text-xs font-medium text-gray-600 w-6/12">
                  Descripció
                </th>
                <th className="p-2 text-center text-xs font-medium text-gray-600 w-1/12">
                  Quantitat
                </th>
                <th className="p-2 text-center text-xs font-medium text-gray-600 w-1/12">
                  Preu Unitari
                </th>
                <th className="p-2 text-center text-xs font-medium text-gray-600 w-1/12">
                  % Dte.
                </th>
                <th className="p-2 text-center text-xs font-medium text-gray-600 w-1/12">
                  Import Dte.
                </th>
                <th className="p-2 text-center text-xs font-medium text-gray-600 w-2/12">
                  Total Línia
                </th>
              </tr>
            </thead>
            <tbody>
              {workOrder.items.map((item, itemIndex) => (
                <tr
                  key={itemIndex}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <td className="p-2 text-sm">{item.description}</td>
                  <td className="p-2 text-center text-sm">{item.quantity}</td>
                  <td className="p-2 text-center text-sm">
                    {formatEuropeanCurrency(item.unitPrice.toFixed(2))}
                  </td>
                  <td className="p-2 text-center text-sm">
                    {item.discountPercentage}%
                  </td>
                  <td className="p-2 text-center text-sm">
                    {formatEuropeanCurrency(item.discountAmount.toFixed(2))}
                  </td>
                  <td className="p-2 text-center text-sm font-medium">
                    {formatEuropeanCurrency(item.lineTotal.toFixed(2))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};
