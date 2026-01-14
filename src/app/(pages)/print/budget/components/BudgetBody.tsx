import { Budget } from 'app/interfaces/Budget';
import { formatCurrencyServerSider } from 'app/utils/utils';

export const BudgetBody = ({ budget }: { budget: Budget }) => {
  return (
    <div className="mt-6 space-y-6">
      <div className="border border-gray-300 rounded">
        {/* Budget Items Header */}
        <div className="bg-gray-100 p-3 border-b border-gray-300">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm">Detall del Pressupost</h3>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-300">
              <th className="p-2 text-left text-xs font-medium text-gray-600 w-5/12">
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
            {budget.items.map((item, itemIndex) => (
              <tr
                key={itemIndex}
                className="border-b border-gray-200 last:border-b-0"
              >
                <td className="p-2 text-sm">{item.description}</td>
                <td className="p-2 text-center text-sm">{item.quantity}</td>
                <td className="p-2 text-center text-sm">
                  {formatCurrencyServerSider(item.unitPrice)}
                </td>
                <td className="p-2 text-center text-sm">
                  {item.discountPercentage}%
                </td>
                <td className="p-2 text-center text-sm">
                  {formatCurrencyServerSider(item.discountAmount)}
                </td>
                <td className="p-2 text-center text-sm font-medium">
                  {formatCurrencyServerSider(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* External Comments */}
      {budget.externalComments && (
        <div className="border border-gray-300 rounded p-3">
          <h4 className="font-medium text-sm text-gray-700 mb-2">
            Observacions
          </h4>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {budget.externalComments}
          </p>
        </div>
      )}
    </div>
  );
};
