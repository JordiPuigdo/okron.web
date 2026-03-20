import { TaxBreakdown } from 'app/interfaces/DeliveryNote';
import { formatCurrencyServerSider } from 'app/utils/utils';

interface AssemblyBudgetPrintFooterProps {
  subtotal: number;
  totalTax: number;
  total: number;
  taxBreakdowns: TaxBreakdown[];
}

export const AssemblyBudgetPrintFooter = ({
  subtotal,
  totalTax,
  total,
  taxBreakdowns,
}: AssemblyBudgetPrintFooterProps) => {
  const hasTaxBreakdowns = taxBreakdowns.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto pt-4">
      <div className="border border-gray-300 rounded-lg p-3">
        {hasTaxBreakdowns ? (
          <>
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
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-gray-700">
                Base imposable:
              </span>
              <span className="font-medium text-gray-800">
                {formatCurrencyServerSider(subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-gray-100">
              <span className="text-gray-700">IVA:</span>
              <span className="text-gray-800">
                {formatCurrencyServerSider(totalTax)}
              </span>
            </div>
          </>
        )}

        <div className="flex justify-between items-center py-3 border-t border-gray-300 mt-2">
          <span className="font-bold text-lg text-gray-900">TOTAL:</span>
          <span className="font-bold text-lg text-gray-900">
            {formatCurrencyServerSider(total)}
          </span>
        </div>
      </div>
    </div>
  );
};
