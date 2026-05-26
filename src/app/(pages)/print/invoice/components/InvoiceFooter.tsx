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
    <div className="w-full mt-6 break-inside-avoid">
      {/* Row 1: totals — right-aligned */}
      <div className="flex justify-end border-t border-b py-2">
        <div className="flex flex-col w-1/2">
          {hasTaxBreakdowns ? (
            <>
              {taxBreakdowns.map((breakdown, index) => (
                <div key={`base-${index}`} className="flex flex-row justify-between">
                  <span className="font-semibold">Base imposable {breakdown.taxPercentage}%:</span>
                  <span className="font-semibold">{formatCurrencyServerSider(breakdown.taxableBase)}</span>
                </div>
              ))}
              {taxBreakdowns.map((breakdown, index) => (
                <div key={`iva-${index}`} className="flex flex-row justify-between">
                  <span className="font-semibold">IVA {breakdown.taxPercentage}%:</span>
                  <span className="font-semibold">{formatCurrencyServerSider(breakdown.taxAmount)}</span>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="flex flex-row justify-between">
                <span className="font-semibold">Subtotal:</span>
                <span className="font-semibold">{formatCurrencyServerSider(totals?.subtotal || 0)}</span>
              </div>
              <div className="flex flex-row justify-between">
                <span className="font-semibold">IVA (21%):</span>
                <span className="font-semibold">{formatCurrencyServerSider(totals?.tax || 0)}</span>
              </div>
            </>
          )}
          <div className="flex flex-row justify-between text-base border-t pt-2 mt-2">
            <span className="font-bold">Total:</span>
            <span className="font-bold">{formatCurrencyServerSider(totals?.total || 0)}</span>
          </div>
        </div>
      </div>

      {/* Row 2: payment info — full width, below totals */}
      <div className="flex flex-col gap-1 mt-6 text-sm text-gray-700">
        <div>
          <span className="font-semibold">Forma de pagament: </span>
          {invoice.paymentMethod.description}
        </div>
        {company.iban && (
          <div>
            <span className="font-semibold">Número de compte: </span>
            {company.iban}
          </div>
        )}
        {invoice.paymentMethod.days > 0 && (
          <div>
            <span className="font-semibold">Total a pagar en dies: </span>
            {invoice.paymentMethod.days}
          </div>
        )}
      </div>
    </div>
  );
};
