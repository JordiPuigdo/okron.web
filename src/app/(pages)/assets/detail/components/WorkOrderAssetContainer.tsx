'use client';

import { useEffect, useState } from 'react';
import { SvgSpinner } from 'app/icons/icons';
import { UserType } from 'app/interfaces/User';
import WorkOrder, {
  OriginWorkOrder,
  SearchWorkOrderFilters,
} from 'app/interfaces/workOrder';
import { workOrderService } from 'app/services/workOrderService';

import WorkOrderList from './WorkOrderList';

interface WorkOrderContainerProps {
  assetId: string;
  operatorId: string;
  startDate: Date;
  endDate: Date;
  userType: UserType;
  searchPreventive?: boolean;
}

const WorkOrderContainer = ({
  assetId,
  operatorId,
  startDate,
  endDate,
  userType,
  searchPreventive = false,
}: WorkOrderContainerProps) => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[] | []>([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    handleSearch();
  }, [assetId, operatorId, startDate, endDate, userType]);

  const handleSearch = async () => {
    setIsLoading(true);
    let search: SearchWorkOrderFilters;
    try {
      search = {
        assetId: assetId,
        operatorId: operatorId || '',
        startDateTime: startDate!,
        endDateTime: endDate!,
        originWorkOrder: OriginWorkOrder.Maintenance,
        userType: userType,
        showNextWO: searchPreventive,
      };

      const data = await workOrderService.getWorkOrdersWithFilters(search);
      setWorkOrders(data);
    } catch (error) {
      console.error('Error fetching work orders:', error);
      return;
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      {isLoading && <SvgSpinner />}

      {!isLoading && <WorkOrderList workOrders={workOrders} />}
    </div>
  );
};

export default WorkOrderContainer;
