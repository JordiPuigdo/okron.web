import { Order, OrderType } from 'app/interfaces/Order';

interface OrdersButtonsProps {
  orderId: string;
  order: Order;
}

/**
 * OrdersButtons - Botones adicionales específicos para órdenes.
 *
 * Nota: Los botones de WhatsApp y Crear Albarà se han movido al
 * OrderPreviewPanel para simplificar la tabla y centralizar acciones.
 */
export const OrdersButtons = ({ order }: OrdersButtonsProps) => {
  // Los albaranes de recepción no necesitan botones adicionales en la tabla
  if (order.type === OrderType.Delivery) return null;

  // Las acciones de WhatsApp y Crear Albarà están ahora en el Preview Panel
  return null;
};
