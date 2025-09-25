import { Invoice } from 'app/interfaces/Invoice';
import { formatEuropeanCurrency } from 'app/utils/utils';

export const InvoiceFooter = ({ invoice }: { invoice: Invoice }) => {
  const totals = invoice.deliveryNotes?.reduce(
    (acc, dn) => {
      acc.subtotal += dn.subtotal || 0;
      acc.tax += dn.totalTax || 0;
      acc.total += dn.total || 0;
      return acc;
    },
    { subtotal: 0, tax: 0, total: 0 }
  );

  return (
    <div className="flex justify-between w-full p-2 ">
      <div className="flex w-full flex-col gap-2">
        <div>Forma de pagament: Transferència / Ingrés</div>
        <div>Número de compte:</div>
        <div>Venciment: Total a pagar en dies:</div>
      </div>

      <div className="flex  w-full">
        <div className="flex flex-col w-full border-t border-b ">
          <div className="flex flex-row justify-between">
            <div className="font-bold">Subtotal:</div>
            <div className="font-bold">
              {formatEuropeanCurrency(totals?.subtotal || 0)}
            </div>
          </div>
          <div className="flex flex-row justify-between">
            <div className="font-bold">IVA (21%):</div>
            <div className="font-bold">
              {formatEuropeanCurrency(totals?.tax || 0)}
            </div>
          </div>
          <div className="flex flex-row justify-between text-lg border-t pt-2 mt-2">
            <div className="font-bold">Total:</div>
            <div className="font-bold">
              {formatEuropeanCurrency(totals?.total || 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
