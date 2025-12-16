import Company from 'app/interfaces/Company';
import { Invoice } from 'app/interfaces/Invoice';
import { formatCurrencyServerSider } from 'app/utils/utils';

interface TaxBreakdownSummary {
  taxPercentage: number;
  taxableBase: number;
  taxAmount: number;
}

export const InvoiceFooter = ({
  invoice,
  company,
}: {
  invoice: Invoice;
  company: Company;
}) => {
  // Agrupar taxBreakdowns de todos los delivery notes por porcentaje
  const taxBreakdownsMap = new Map<number, TaxBreakdownSummary>();

  invoice.deliveryNotes?.forEach(dn => {
    if (dn.taxBreakdowns && dn.taxBreakdowns.length > 0) {
      dn.taxBreakdowns.forEach(breakdown => {
        const existing = taxBreakdownsMap.get(breakdown.taxPercentage);
        if (existing) {
          existing.taxableBase += breakdown.taxableBase;
          existing.taxAmount += breakdown.taxAmount;
        } else {
          taxBreakdownsMap.set(breakdown.taxPercentage, {
            taxPercentage: breakdown.taxPercentage,
            taxableBase: breakdown.taxableBase,
            taxAmount: breakdown.taxAmount,
          });
        }
      });
    }
  });

  const taxBreakdowns = Array.from(taxBreakdownsMap.values()).sort(
    (a, b) => a.taxPercentage - b.taxPercentage
  );
  const hasTaxBreakdowns = taxBreakdowns.length > 0;

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
        <div>Forma de pagament: {invoice.paymentMethod.description}</div>
        <div>Número de compte: {company.iban}</div>
        {invoice.paymentMethod.days > 0 && (
          <div>Total a pagar en dies: {invoice.paymentMethod.days}</div>
        )}
      </div>

      <div className="flex  w-full">
        <div className="flex flex-col w-full border-t border-b ">
          {hasTaxBreakdowns ? (
            <>
              {/* Bases imponibles agrupadas por % */}
              {taxBreakdowns.map((breakdown, index) => (
                <div
                  key={`base-${index}`}
                  className="flex flex-row justify-between"
                >
                  <div className="font-bold">
                    Base imposable {breakdown.taxPercentage}%:
                  </div>
                  <div className="font-bold">
                    {formatCurrencyServerSider(breakdown.taxableBase)}
                  </div>
                </div>
              ))}

              {/* IVAs agrupados por % */}
              {taxBreakdowns.map((breakdown, index) => (
                <div
                  key={`iva-${index}`}
                  className="flex flex-row justify-between"
                >
                  <div className="font-bold">
                    IVA {breakdown.taxPercentage}%:
                  </div>
                  <div className="font-bold">
                    {formatCurrencyServerSider(breakdown.taxAmount)}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {/* Fallback al formato antiguo si no hay taxBreakdowns */}
              <div className="flex flex-row justify-between">
                <div className="font-bold">Subtotal:</div>
                <div className="font-bold">
                  {formatCurrencyServerSider(totals?.subtotal || 0)}
                </div>
              </div>
              <div className="flex flex-row justify-between">
                <div className="font-bold">IVA (21%):</div>
                <div className="font-bold">
                  {formatCurrencyServerSider(totals?.tax || 0)}
                </div>
              </div>
            </>
          )}

          {/* Total */}
          <div className="flex flex-row justify-between text-lg border-t pt-2 mt-2">
            <div className="font-bold">Total:</div>
            <div className="font-bold">
              {formatCurrencyServerSider(totals?.total || 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
