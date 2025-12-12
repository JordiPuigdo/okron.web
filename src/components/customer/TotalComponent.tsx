import { TaxBreakdown } from 'app/interfaces/DeliveryNote';
import { formatCurrencyServerSider } from 'app/utils/utils';

interface TotalComponentProps {
  subtotal: number;
  totalTax: number;
  total: number;
  taxBreakdowns?: TaxBreakdown[];
}

export const TotalComponent = ({
  subtotal,
  totalTax,
  total,
  taxBreakdowns,
}: TotalComponentProps) => {
  return (
    <div className="flex justify-end">
      <div className="w-96 space-y-2 p-4 border rounded-lg bg-gray-50">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrencyServerSider(subtotal)}</span>
        </div>

        {/* Desglose de IVAs por porcentaje */}
        {taxBreakdowns && taxBreakdowns.length > 0 ? (
          taxBreakdowns.map((breakdown, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Base IVA {breakdown.taxPercentage}%:</span>
                <span>{formatCurrencyServerSider(breakdown.taxableBase)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA {breakdown.taxPercentage}%:</span>
                <span>{formatCurrencyServerSider(breakdown.taxAmount)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-between">
            <span>IVA:</span>
            <span>{formatCurrencyServerSider(totalTax)}</span>
          </div>
        )}

        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total:</span>
          <span>{formatCurrencyServerSider(total)}</span>
        </div>
      </div>
    </div>
  );
};
