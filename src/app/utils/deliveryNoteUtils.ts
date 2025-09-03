import { DeliveryNoteStatus } from 'app/interfaces/DeliveryNote';

export const translateDeliveryNoteStatus = (
  status: DeliveryNoteStatus
): string => {
  switch (status) {
    case DeliveryNoteStatus.Draft:
      return 'Borrador';
    case DeliveryNoteStatus.Sent:
      return 'Enviat';
    case DeliveryNoteStatus.Paid:
      return 'Pagat';
    case DeliveryNoteStatus.NotValued:
      return 'No Valorat';
    case DeliveryNoteStatus.Valued:
      return 'Valorat';
    case DeliveryNoteStatus.Cancelled:
      return 'Cancel·lat';
    default:
      return 'Desconegut';
  }
};
export const getDeliveryNoteStatusColor = (
  status: DeliveryNoteStatus
): string => {
  switch (status) {
    case DeliveryNoteStatus.Draft:
      return 'bg-gray-100 text-gray-800';
    case DeliveryNoteStatus.Sent:
      return 'bg-blue-100 text-blue-800';
    case DeliveryNoteStatus.Paid:
      return 'bg-green-100 text-green-800';
    case DeliveryNoteStatus.Cancelled:
      return 'bg-red-100 text-red-800';
    case DeliveryNoteStatus.NotValued:
      return 'bg-red-200 text-red-900';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const calculateDeliveryNoteTotals = (items: any[]) => {
  const subtotal = items.reduce((sum, item) => {
    return (
      sum + item.quantity * item.unitPrice * (1 - item.discountPercentage / 100)
    );
  }, 0);

  const taxAmount = subtotal * 0.21; // 21% IVA
  const totalAmount = subtotal + taxAmount;

  return {
    subtotal,
    taxAmount,
    totalAmount,
  };
};
