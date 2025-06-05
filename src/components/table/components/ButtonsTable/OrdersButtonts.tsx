import { useState } from 'react';
import { Order, OrderStatus, OrderType } from 'app/interfaces/Order';
import Link from 'next/link';

interface OrdersButtonsProps {
  orderId: string;
  phoneNumber?: string;
  order: Order;
}

export const OrdersButtons = ({
  orderId,
  phoneNumber,
  order,
}: OrdersButtonsProps) => {
  if (order.type == OrderType.Delivery) return;
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const handleWhatsAppShare = () => {
    // Remove any non-numeric characters and ensure it starts with 34
    const formattedPhone = phoneNumber
      ?.replace(/\D/g, '')
      .replace(/^(?!34)/, '34');
    const waLink = `https://wa.me/${formattedPhone}?text=La seva comanda ${orderId} està preparada per entregar`;
    window.open(waLink, '_blank');
  };

  const isCompleted = order.status == OrderStatus.Completed;

  return (
    <div className="flex items-center gap-2">
      {/* WhatsApp Button */}
      <div className="relative group">
        <button
          className={`p-2 rounded-full transition-colors 

              bg-green-500 hover:bg-green-600
          `}
          onClick={handleWhatsAppShare}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </button>
        <div className="absolute invisible group-hover:visible bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
          Enviar WhatsApp
        </div>
      </div>

      <div className="relative group">
        <Link
          href={`/orders/orderForm?purchaseOrderId=${orderId}`}
          aria-disabled={isCompleted}
          className={`${isCompleted} ? 'pointer-events-none' : ''}`}
        >
          <button
            className={`p-2 ${
              isCompleted
                ? 'bg-gray-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600 transition-colors'
            } rounded-full `}
            disabled={isCompleted}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          </button>
        </Link>
        {!isCompleted && (
          <div className="absolute invisible group-hover:visible bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
            Crear Albarà
          </div>
        )}
      </div>
    </div>
  );
};
