import { formatCurrencyServerSider } from 'app/utils/utils';

interface TotalComponentProps {
  subtotal: number;
  totalTax: number;
  total: number;
}

export const TotalComponent = ({
  subtotal,
  totalTax,
  total,
}: TotalComponentProps) => {
  return (
    <div className="flex justify-end">
      <div className="w-96 space-y-2 p-4 border rounded-lg bg-gray-50">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrencyServerSider(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>IVA (21%):</span>
          <span>{formatCurrencyServerSider(totalTax)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total:</span>
          <span>{formatCurrencyServerSider(total)}</span>
        </div>
      </div>
    </div>
  );
};
