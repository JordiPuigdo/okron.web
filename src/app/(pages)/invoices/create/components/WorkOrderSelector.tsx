'use client';

import { useEffect, useState } from 'react';
import { SvgDelete, SvgSearch } from 'app/icons/icons';
import { UserType } from 'app/interfaces/User';
import WorkOrder, { OriginWorkOrder, SearchWorkOrderFilters, StateWorkOrder } from 'app/interfaces/workOrder';
import WorkOrderService from 'app/services/workOrderService';
import { useSessionStore } from 'app/stores/globalStore';
import { formatDate, translateStateWorkOrder } from 'app/utils/utils';

interface WorkOrderSelectorProps {
  selectedWorkOrders: WorkOrder[];
  onWorkOrdersChange: (workOrders: WorkOrder[]) => void;
}

const WorkOrderSelector: React.FC<WorkOrderSelectorProps> = ({
                                                               selectedWorkOrders,
                                                               onWorkOrdersChange
                                                             }) => {
  const [availableWorkOrders, setAvailableWorkOrders] = useState<WorkOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const workOrderService = new WorkOrderService(process.env.NEXT_PUBLIC_API_BASE_URL!);
  const { loginUser } = useSessionStore(state => state);

  useEffect(() => {
    loadInitialWorkOrders();
  }, []);

  // Load initial 10 work orders
  const loadInitialWorkOrders = async () => {
    setIsLoading(true);
    try {
      const search: SearchWorkOrderFilters = {
        assetId: '',
        operatorId: '',
        startDateTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        endDateTime: new Date(),
        originWorkOrder: loginUser?.userType === UserType.Maintenance
          ? OriginWorkOrder.Maintenance
          : OriginWorkOrder.Production,
        userType: loginUser?.userType || UserType.Maintenance,
      };

      search.stateWorkOrder = StateWorkOrder.Waiting;
      const workOrders = await workOrderService.getWorkOrdersWithFilters(search);

      // Get only the latest 10, sorted by creation date
      const latest10 = workOrders
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 10)
        .filter(wo => !selectedWorkOrders.some(selected => selected.id === wo.id));

      setAvailableWorkOrders(latest10);
    } catch (error) {
      console.error('Error loading work orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Search work orders by RefCustomerId or code
  const searchWorkOrders = async (searchValue: string) => {
    if (!searchValue.trim()) {
      loadInitialWorkOrders();
      return;
    }

    setIsSearching(true);
    try {
      const search: SearchWorkOrderFilters = {
        assetId: '',
        operatorId: '',
        startDateTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days for search
        endDateTime: new Date(),
        originWorkOrder: loginUser?.userType === UserType.Maintenance
          ? OriginWorkOrder.Maintenance
          : OriginWorkOrder.Production,
        userType: loginUser?.userType || UserType.Maintenance,
      };

      search.stateWorkOrder = StateWorkOrder.Finished;
      const allWorkOrders = await workOrderService.getWorkOrdersWithFilters(search);

      // Filter by RefCustomerId or code
      const filtered = allWorkOrders
        .filter(wo => {
          const matchesCode = wo.code.toLowerCase().includes(searchValue.toLowerCase());
          const matchesRef = wo.refCustomerId?.toLowerCase().includes(searchValue.toLowerCase()) || false;
          const notSelected = !selectedWorkOrders.some(selected => selected.id === wo.id);

          return (matchesCode || matchesRef) && notSelected;
        })
        .slice(0, 20); // Limit results to 20

      setAvailableWorkOrders(filtered);
    } catch (error) {
      console.error('Error searching work orders:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    // Debounce search
    const timeoutId = setTimeout(() => {
      searchWorkOrders(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleSelectWorkOrder = (workOrder: WorkOrder) => {
    onWorkOrdersChange([...selectedWorkOrders, workOrder]);
    setAvailableWorkOrders(prev => prev.filter(wo => wo.id !== workOrder.id));
    // Don't close the list, keep it open for multiple selections
  };

  const handleRemoveWorkOrder = (workOrderId: string) => {
    const removedWorkOrder = selectedWorkOrders.find(wo => wo.id === workOrderId);
    if (removedWorkOrder) {
      onWorkOrdersChange(selectedWorkOrders.filter(wo => wo.id !== workOrderId));
      // Refresh the list to potentially show the removed item again
      if (searchTerm.trim()) {
        searchWorkOrders(searchTerm);
      } else {
        loadInitialWorkOrders();
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar per codi o ref. client..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md pl-10"
        />
        <SvgSearch/>

        {/* Work Orders List - Always visible */}
        <div className="mt-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {/* Header */}
          <div className="p-2 bg-gray-50 border-b text-sm font-medium text-gray-700">
            {searchTerm.trim()
              ? `Resultats de cerca (${availableWorkOrders.length})`
              : `Últimes 10 ordres (${availableWorkOrders.length})`
            }
          </div>

          {/* Loading state */}
          {(isLoading || isSearching) && (
            <div className="p-4 text-center text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                {isSearching ? 'Cercant...' : 'Carregant...'}
              </div>
            </div>
          )}

          {/* No results */}
          {!isLoading && !isSearching && availableWorkOrders.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              {searchTerm.trim()
                ? 'No s\'han trobat ordres amb aquest criteri'
                : 'No hi ha ordres disponibles'
              }
            </div>
          )}

          {/* Work Orders List */}
          {!isLoading && !isSearching && availableWorkOrders.map(workOrder => (
            <div
              key={workOrder.id}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
              onClick={() => handleSelectWorkOrder(workOrder)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-blue-600">{workOrder.code}</div>
                  <div className="text-sm text-gray-600 truncate">{workOrder.description}</div>
                  <div className="text-xs text-gray-500 flex gap-4">
                    <span>{workOrder.asset?.description}</span>
                    {workOrder.refCustomerId && (
                      <span className="text-blue-500">Ref: {workOrder.refCustomerId}</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  <div>{formatDate(workOrder.startTime)}</div>
                  <div className="text-green-600">{translateStateWorkOrder(workOrder.stateWorkOrder)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Work Orders */}
      {selectedWorkOrders.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Ordres Seleccionades ({selectedWorkOrders.length}):</h4>
          {selectedWorkOrders.map(workOrder => (
            <div
              key={workOrder.id}
              className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md"
            >
              <div className="flex-1">
                <div className="font-medium text-blue-800">{workOrder.code}</div>
                <div className="text-sm text-gray-600">{workOrder.description}</div>
                <div className="text-xs text-gray-500 flex gap-4">
                  <span>{workOrder.asset?.description}</span>
                  {workOrder.refCustomerId && (
                    <span className="text-blue-600">Ref: {workOrder.refCustomerId}</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveWorkOrder(workOrder.id)}
                className="text-red-500 hover:text-red-700 p-1"
                title="Eliminar de la selecció"
              >
                <SvgDelete className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkOrderSelector;