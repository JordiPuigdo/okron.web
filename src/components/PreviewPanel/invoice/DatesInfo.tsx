'use client';

import { Invoice, InvoiceStatus } from 'app/interfaces/Invoice';

import { DateCard } from '../DateCard';

interface DatesInfoProps {
  invoice: Invoice;
}

/**
 * Muestra las fechas de factura y vencimiento.
 * Marca el vencimiento con warning si está vencido y pendiente.
 */
export function DatesInfo({ invoice }: DatesInfoProps) {
  const invoiceDate = invoice.creationDate
    ? new Date(invoice.creationDate)
    : new Date();
  const dueDate = new Date(invoice.dueDate);
  const isOverdue =
    dueDate < new Date() && invoice.status === InvoiceStatus.Pending;

  return (
    <div className="grid grid-cols-2 gap-4">
      <DateCard label="Data factura" date={invoiceDate} />
      <DateCard label="Venciment" date={dueDate} isWarning={isOverdue} />
    </div>
  );
}
