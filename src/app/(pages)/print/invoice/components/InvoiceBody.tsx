import { TranslateFn } from 'app/hooks/useTranslations';
import { DeliveryNote } from 'app/interfaces/DeliveryNote';
import { formatEuropeanCurrency } from 'app/utils/utils';
import dayjs from 'dayjs';

export const InvoiceBody = ({
  deliveryNotes,
  t = (key: string) => key,
}: {
  deliveryNotes: DeliveryNote[];
  t?: TranslateFn;
}) => {
  return (
    <div className="mt-6 space-y-6">
      {deliveryNotes.map((deliveryNote, dnIndex) => (
        <div key={dnIndex} className="space-y-4">
          {deliveryNote.workOrders.map((workOrder, woIndex) => (
            <div
              key={woIndex}
              className="border border-gray-300 rounded overflow-hidden"
            >
              {/* Work Order Header */}
              <div className="bg-gray-100 p-3 border-b border-gray-300">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm">
                    {dayjs(workOrder.workOrderStartTime).format('DD/MM/YYYY')} -{' '}
                    {workOrder.workOrderCode} -
                    {workOrder.workOrderRefId !== null
                      ? ' OT ' + workOrder.workOrderRefId
                      : ''}
                    {deliveryNote.installation?.code
                      ? ' - ' + deliveryNote.installation?.code
                      : ''}
                  </h3>
                </div>
                <p className="text-sm mt-1">{workOrder.concept}</p>
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
                      Total
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
                      <td className="p-2 text-center text-sm">
                        {item.quantity}
                      </td>
                      <td className="p-2 text-center text-sm">
                        {formatEuropeanCurrency(item.unitPrice, t)}
                      </td>
                      <td className="p-2 text-center text-sm">
                        {item.discountPercentage}%
                      </td>
                      <td className="p-2 text-center text-sm">
                        {formatEuropeanCurrency(item.discountAmount, t)}
                      </td>
                      <td className="p-2 text-center text-sm font-medium">
                        {formatEuropeanCurrency(item.lineTotal, t)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
