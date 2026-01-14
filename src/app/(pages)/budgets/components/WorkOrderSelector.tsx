'use client';

import { useEffect, useState } from 'react';
import { UserType } from 'app/interfaces/User';
import { OriginWorkOrder, WorkOrder } from 'app/interfaces/workOrder';
import { workOrderService } from 'app/services/workOrderService';
import { Briefcase, Check, Search, X } from 'lucide-react';

interface WorkOrderSelectorProps {
  customerId?: string;
  selectedWorkOrderId?: string;
  onSelect: (workOrder: WorkOrder | undefined) => void;
  disabled?: boolean;
}

/**
 * Componente para seleccionar una WorkOrder asociada al presupuesto.
 * Single Responsibility: Solo gestiona la búsqueda y selección de WorkOrders.
 *
 * TODO: Cuando el backend soporte filtrar por customerId, implementar búsqueda automática.
 */
export function WorkOrderSelector({
  customerId,
  selectedWorkOrderId,
  onSelect,
  disabled = false,
}: WorkOrderSelectorProps) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<
    WorkOrder | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch work orders (sin filtrar por cliente por ahora)
  useEffect(() => {
    // Solo cargar si hay cliente seleccionado
    if (customerId) {
      fetchWorkOrders();
    } else {
      setWorkOrders([]);
      setSelectedWorkOrder(undefined);
    }
  }, [customerId]);

  const fetchWorkOrders = async () => {
    setIsLoading(true);
    try {
      // Cargar work orders recientes de mantenimiento
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6); // Últimos 6 meses

      const orders = await workOrderService.getWorkOrdersWithFilters({
        userType: UserType.CRM,
        originWorkOrder: OriginWorkOrder.Maintenance,
        hasDeliveryNote: false,
        customerId: customerId,
      });
      setWorkOrders(orders.slice(0, 50)); // Limitar a 50 para performance
    } catch (error) {
      console.error('Error fetching work orders:', error);
      setWorkOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    onSelect(workOrder);
    setIsExpanded(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSelectedWorkOrder(undefined);
    onSelect(undefined);
  };

  const filteredWorkOrders = workOrders.filter(
    wo =>
      wo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!customerId) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 text-sm">
        <Briefcase className="w-5 h-5 inline mr-2" />
        Selecciona primer un client per veure les ordres de treball
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        <Briefcase className="w-4 h-4 inline mr-1" />
        Ordre de treball (opcional)
      </label>

      {selectedWorkOrder ? (
        // Selected Work Order Card
        <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
          <div className="flex-shrink-0 w-10 h-10 bg-[#6E41B6] rounded-full flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {selectedWorkOrder.code}
            </p>
            <p className="text-sm text-gray-600 truncate">
              {selectedWorkOrder.description}
            </p>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        // Selector
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsExpanded(!isExpanded)}
            disabled={disabled || isLoading}
            className={`w-full p-3 border-2 rounded-xl text-left transition-colors ${
              isExpanded
                ? 'border-[#6E41B6] bg-white'
                : 'border-gray-200 bg-white hover:border-purple-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="text-gray-500">
              {isLoading
                ? 'Carregant ordres de treball...'
                : workOrders.length === 0
                ? 'No hi ha ordres de treball disponibles'
                : 'Selecciona una ordre de treball...'}
            </span>
          </button>

          {/* Dropdown */}
          {isExpanded && workOrders.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {/* Search */}
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Cercar..."
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#6E41B6] focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* Options */}
              <div className="max-h-48 overflow-y-auto">
                {filteredWorkOrders.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    No s'han trobat resultats
                  </div>
                ) : (
                  filteredWorkOrders.map(wo => (
                    <button
                      key={wo.id}
                      type="button"
                      onClick={() => handleSelect(wo)}
                      className="w-full p-3 text-left hover:bg-purple-50 transition-colors border-b border-gray-50 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Briefcase className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {wo.code}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {wo.description}
                          </p>
                        </div>
                        {wo.id === selectedWorkOrderId && (
                          <Check className="w-5 h-5 text-[#6E41B6]" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
