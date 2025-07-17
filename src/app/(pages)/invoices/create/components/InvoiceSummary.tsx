'use client';

interface InvoiceSummaryProps {
  subtotal: number;
  totalTax: number;
  total: number;
  itemCount: number;
}

const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
                                                         subtotal,
                                                         totalTax,
                                                         total,
                                                         itemCount
                                                       }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center py-2 border-b border-gray-200">
        <span className="text-sm text-gray-600">Items a la factura:</span>
        <span className="font-medium">{itemCount}</span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Subtotal:</span>
          <span className="font-medium">{subtotal.toFixed(2)}€</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">IVA (21%):</span>
          <span className="font-medium">{totalTax.toFixed(2)}€</span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-300">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-lg font-bold text-green-600">{total.toFixed(2)}€</span>
        </div>
      </div>

      {itemCount === 0 && (
        <div className="text-center py-4 text-amber-600 bg-amber-50 rounded border border-amber-200">
          Afegiu items per veure el resum de la factura
        </div>
      )}
    </div>
  );
};

export default InvoiceSummary;