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

// Error messages related to delivery note-based invoices
export const INVOICE_ERROR_MESSAGES = {
  DELIVERY_NOTE_NOT_FOUND: 'No s\'ha trobat l\'albarà especificat',
  DELIVERY_NOTE_NO_ITEMS: 'L\'albarà no conté cap element',
  DELIVERY_NOTE_ALREADY_INVOICED: 'Aquest albarà ja té una factura associada',
  DELIVERY_NOTE_CANCELLED: 'No es pot crear una factura d\'un albarà cancel·lat',
  INVALID_DELIVERY_NOTE_STATUS: 'L\'estat de l\'albarà no permet crear una factura',
  DELIVERY_NOTE_REQUIRED: 'Cal seleccionar un albarà per crear la factura',
  INVOICE_DATE_REQUIRED: 'La data de la factura és obligatòria',
  DUE_DATE_REQUIRED: 'La data de venciment és obligatòria',
  INVOICE_NOT_FOUND: 'No s\'ha trobat la factura especificada',
  SEARCH_FAILED: 'Error en la cerca. Torneu-ho a intentar',
  VALIDATION_FAILED: 'Error de validació. Comproveu les dades introduïdes',
  NETWORK_ERROR: 'Error de connexió. Comproveu la vostra connexió a internet',
  UNAUTHORIZED: 'No teniu permisos per realitzar aquesta acció',
  SERVER_ERROR: 'Error del servidor. Contacteu amb el suport tècnic'
};

export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    // Map common API errors to user-friendly messages
    switch (error.message.toLowerCase()) {
      case 'delivery note not found':
        return INVOICE_ERROR_MESSAGES.DELIVERY_NOTE_NOT_FOUND;
      case 'delivery note contains no items':
        return INVOICE_ERROR_MESSAGES.DELIVERY_NOTE_NO_ITEMS;
      case 'delivery note already has an associated invoice':
        return INVOICE_ERROR_MESSAGES.DELIVERY_NOTE_ALREADY_INVOICED;
      case 'cannot create invoice from cancelled delivery note':
        return INVOICE_ERROR_MESSAGES.DELIVERY_NOTE_CANCELLED;
      case 'failed to search invoices':
      case 'failed to search delivery notes':
        return INVOICE_ERROR_MESSAGES.SEARCH_FAILED;
      case 'failed to create invoice':
      case 'failed to update invoice':
      case 'failed to fetch invoice':
        return INVOICE_ERROR_MESSAGES.SERVER_ERROR;
      case 'network error':
        return INVOICE_ERROR_MESSAGES.NETWORK_ERROR;
      case 'unauthorized':
        return INVOICE_ERROR_MESSAGES.UNAUTHORIZED;
      default:
        return error.message;
    }
  }
  
  return INVOICE_ERROR_MESSAGES.SERVER_ERROR;
};