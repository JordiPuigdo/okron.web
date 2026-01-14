import { Budget } from 'app/interfaces/Budget';
import { formatCurrencyServerSider } from 'app/utils/utils';

export const BudgetFooter = ({ budget }: { budget: Budget }) => {
  const taxBreakdowns = budget.taxBreakdowns || [];
  const hasTaxBreakdowns = taxBreakdowns.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto pt-2">
      {/* Totals Section */}
      <div className="border border-gray-300 rounded-lg p-2">
        <div>
          {hasTaxBreakdowns ? (
            <>
              {/* Bases imponibles agrupadas por % */}
              {taxBreakdowns.map((breakdown, index) => (
                <div
                  key={`base-${index}`}
                  className="flex justify-between items-center py-2"
                >
                  <span className="font-medium text-gray-700">
                    Base imposable {breakdown.taxPercentage}%:
                  </span>
                  <span className="font-medium text-gray-800">
                    {formatCurrencyServerSider(breakdown.taxableBase)}
                  </span>
                </div>
              ))}

              {/* IVAs agrupados por % */}
              {taxBreakdowns.map((breakdown, index) => (
                <div
                  key={`iva-${index}`}
                  className="flex justify-between items-center py-2 border-t border-gray-100"
                >
                  <span className="text-gray-700">
                    IVA {breakdown.taxPercentage}%:
                  </span>
                  <span className="text-gray-800">
                    {formatCurrencyServerSider(breakdown.taxAmount)}
                  </span>
                </div>
              ))}
            </>
          ) : (
            <>
              {/* Fallback al formato antiguo si no hay taxBreakdowns */}
              <div className="flex justify-between items-center py-2">
                <span className="font-medium text-gray-700">
                  Base imposable:
                </span>
                <span className="font-medium text-gray-800">
                  {formatCurrencyServerSider(budget.subtotal)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-gray-100">
                <span className="text-gray-700">IVA:</span>
                <span className="text-gray-800">
                  {formatCurrencyServerSider(budget.totalTax)}
                </span>
              </div>
            </>
          )}

          {/* Total */}
          <div className="flex justify-between items-center py-3 border-t border-gray-300 mt-2">
            <span className="font-bold text-lg text-gray-900">TOTAL:</span>
            <span className="font-bold text-lg text-gray-900">
              {formatCurrencyServerSider(budget.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
