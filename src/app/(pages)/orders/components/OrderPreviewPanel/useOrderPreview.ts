import { Order, ReturnOrder } from 'app/interfaces/Order';
import { orderService } from 'app/services/orderService';
import useSWR from 'swr';

const SWR_OPTIONS = {
  revalidateOnFocus: false,
  revalidateIfStale: false,
  revalidateOnReconnect: false,
};

interface UseOrderPreviewOptions {
  order: Order | null;
  isOpen: boolean;
}

interface UseOrderPreviewReturn {
  displayOrder: Order | null;
  relatedOrders: Order[];
  returnOrders: ReturnOrder[];
  isLoading: boolean;
}

export function useOrderPreview({
  order,
  isOpen,
}: UseOrderPreviewOptions): UseOrderPreviewReturn {
  const orderId = isOpen && order?.id ? order.id : null;

  const { data: fullOrder, isLoading: isLoadingOrder } = useSWR(
    orderId ? ['order', orderId] : null,
    ([, id]: [string, string]) => orderService.getById(id),
    SWR_OPTIONS
  );

  const relationOrderIds =
    fullOrder?.relationOrders?.map(rel => rel.relationOrderId) ?? [];

  const { data: relatedOrders, isLoading: isLoadingRelated } = useSWR(
    orderId && relationOrderIds.length > 0
      ? ['relatedOrders', ...relationOrderIds]
      : null,
    () => orderService.getWithFilters({ ids: relationOrderIds }),
    SWR_OPTIONS
  );

  return {
    displayOrder: fullOrder ?? order,
    relatedOrders: relatedOrders ?? [],
    returnOrders: fullOrder?.returnOrders ?? [],
    isLoading: isLoadingOrder || (relationOrderIds.length > 0 && !!isLoadingRelated),
  };
}
