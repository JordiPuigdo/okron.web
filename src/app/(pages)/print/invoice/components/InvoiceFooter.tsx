import { Invoice } from 'app/interfaces/Invoice';

export const InvoiceFooter = ({ invoice }: { invoice: Invoice }) => {
  return (
    <div className="flex mt-auto w-full justify-end">
      <div className="flex flex-col w-full p-4 border-t border-b my-8 px-7 mx-8">
        <div className="flex flex-row justify-between">
          <div className="font-bold">Subtotal:</div>
          <div className="font-bold">
            {invoice.subtotal.toFixed(2)}€
          </div>
        </div>
        <div className="flex flex-row justify-between">
          <div className="font-bold">IVA (21%):</div>
          <div className="font-bold">
            {invoice.taxAmount.toFixed(2)}€
          </div>
        </div>
        <div className="flex flex-row justify-between text-lg border-t pt-2 mt-2">
          <div className="font-bold">Total:</div>
          <div className="font-bold">
            {invoice.totalAmount.toFixed(2)}€
          </div>
        </div>
      </div>
    </div>
  );
};