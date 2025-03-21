import WorkOrder, { SearchWorkOrderFilters } from 'app/interfaces/workOrder';
import WorkOrderService from 'app/services/workOrderService';
import { Fetcher } from 'swr';

const workOrderService = new WorkOrderService(
  process.env.NEXT_PUBLIC_API_BASE_URL!
);

const fetchWorkOrdersWithFilters = async (
  filters?: SearchWorkOrderFilters
): Promise<WorkOrder[]> => {
  try {
    if (filters) {
      const response = await workOrderService.getWorkOrdersWithFilters(filters);
      return response;
    }
    return [];
  } catch (error) {
    console.error('Error fetching work orders with filters:', error);
    throw error;
  }
};

const fetchWorkOrderById = async (id: string): Promise<WorkOrder> => {
  try {
    const response = await workOrderService.getWorkOrderById(id);
    return response!;
  } catch (error) {
    console.error('Error fetching work order by ID:', error);
    throw error;
  }
};

export const useWorkOrders = () => {
  const fetchById: Fetcher<WorkOrder, string> = id => fetchWorkOrderById(id);

  const fetchWithFilters = async (
    filters?: SearchWorkOrderFilters
  ): Promise<WorkOrder[]> => {
    return await fetchWorkOrdersWithFilters(filters);
  };

  return {
    fetchById,
    fetchWithFilters,
  };
};
