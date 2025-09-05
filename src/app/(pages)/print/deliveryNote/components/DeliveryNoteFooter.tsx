import { DeliveryNote } from 'app/interfaces/DeliveryNote';
import { formatEuropeanCurrency } from 'app/utils/utils';

export const DeliveryNoteFooter = ({
  deliveryNote,
}: {
  deliveryNote: DeliveryNote;
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto pt-2">
      {/* Totals Section */}
      <div className=" border border-gray-300 rounded-lg p-2">
        <div className="">
          {/* Subtotal */}
          <div className="flex justify-between items-center py-2">
            <span className="font-medium text-gray-700">Base imposable:</span>
            <span className="font-medium text-gray-800">
              {formatEuropeanCurrency(deliveryNote.subtotal)}
            </span>
          </div>

          {/* Tax Details */}
          <div className="flex justify-between items-center py-2 border-t border-gray-100">
            <span className="text-gray-700">IVA (21%):</span>
            <span className="text-gray-800">
              {formatEuropeanCurrency(deliveryNote.totalTax)}
            </span>
          </div>

          {/* Other taxes or discounts could be added here */}
          {/* 
            <div className="flex justify-between items-center py-2 border-t border-gray-100">
              <span className="text-gray-700">IRPF (15%):</span>
              <span className="text-gray-800">-150,00 €</span>
            </div>
            */}

          {/* Total */}
          <div className="flex justify-between items-center py-3 border-t border-gray-300 mt-2">
            <span className="font-bold text-lg text-gray-900">TOTAL:</span>
            <span className="font-bold text-lg text-gray-900">
              {formatEuropeanCurrency(deliveryNote.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
