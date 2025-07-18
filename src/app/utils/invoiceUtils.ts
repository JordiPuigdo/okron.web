import { InvoiceStatus } from 'app/interfaces/Invoice';

export const translateInvoiceStatus = (status: InvoiceStatus): string => {
  switch (status) {
    case InvoiceStatus.Draft:
      return 'Borrador';
    case InvoiceStatus.Pending:
      return 'Pendent';
    case InvoiceStatus.Paid:
      return 'Pagada';
    case InvoiceStatus.Cancelled:
      return 'Cancel·lada';
    case InvoiceStatus.Overdue:
      return 'Vençuda';
    default:
      return 'Desconegut';
  }
};

export const getInvoiceStatusColor = (status: InvoiceStatus): string => {
  switch (status) {
    case InvoiceStatus.Draft:
      return 'bg-gray-100 text-gray-800';
    case InvoiceStatus.Pending:
      return 'bg-yellow-100 text-yellow-800';
    case InvoiceStatus.Paid:
      return 'bg-green-100 text-green-800';
    case InvoiceStatus.Cancelled:
      return 'bg-red-100 text-red-800';
    case InvoiceStatus.Overdue:
      return 'bg-red-200 text-red-900';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const calculateInvoiceTotals = (items: any[]) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity * item.unitPrice * (1 - item.discount / 100));
  }, 0);

  const taxAmount = subtotal * 0.21; // 21% IVA
  const totalAmount = subtotal + taxAmount;

  return {
    subtotal,
    taxAmount,
    totalAmount,
  };
};