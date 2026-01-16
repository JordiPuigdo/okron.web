import { useEffect, useState } from 'react';
import { Order } from 'app/interfaces/Order';
import { OrderService } from 'app/services/orderService';

// ============================================================================
// HOOK: Gestión de carga de orden completa
// ============================================================================

interface UseOrderPreviewOptions {
  order: Order | null;
  isOpen: boolean;
}

interface UseOrderPreviewReturn {
  displayOrder: Order | null;
  relatedOrders: Order[];
  isLoading: boolean;
}

/**
 * Hook para gestionar la carga de la orden completa y sus relacionadas.
 * SRP: Solo maneja la lógica de fetch y estado de carga.
 */
export function useOrderPreview({
  order,
  isOpen,
}: UseOrderPreviewOptions): UseOrderPreviewReturn {
  const [fullOrder, setFullOrder] = useState<Order | null>(null);
  const [relatedOrders, setRelatedOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && order?.id) {
      fetchFullOrderAndRelated(order);
    } else if (!isOpen) {
      setFullOrder(null);
      setRelatedOrders([]);
    }
  }, [isOpen, order?.id]);

  async function fetchFullOrderAndRelated(partialOrder: Order) {
    setIsLoading(true);

    try {
      const orderService = new OrderService(
        process.env.NEXT_PUBLIC_API_BASE_URL || ''
      );

      // Cargar orden principal
      const data = await orderService.getById(partialOrder.id);
      setFullOrder(data);

      // Cargar órdenes relacionadas (albarans de recepción)
      if (data.relationOrders && data.relationOrders.length > 0) {
        const relationOrderIds = data.relationOrders.map(
          rel => rel.relationOrderId
        );
        const relatedData = await orderService.getWithFilters({
          ids: relationOrderIds,
        });
        setRelatedOrders(relatedData);
      } else {
        setRelatedOrders([]);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      // Fallback a la orden parcial si falla
      setFullOrder(partialOrder);
      setRelatedOrders([]);
    } finally {
      setIsLoading(false);
    }
  }

  // Usar la orden completa si está disponible, sino la parcial
  const displayOrder = fullOrder || order;

  return { displayOrder, relatedOrders, isLoading };
}
