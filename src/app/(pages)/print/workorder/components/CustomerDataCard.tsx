import React from 'react';
import WorkOrder from 'app/interfaces/workOrder';
import dayjs from 'dayjs';

interface CustomerDataProps {
  workOrder: WorkOrder;
  isCRM: boolean;
}

const CustomerDataCard: React.FC<CustomerDataProps> = ({
  workOrder,
  isCRM,
}) => {
  if (!isCRM) return null;

  return (
    <div className="flex flex-col gap-2">
      {/* Botiga */}
      <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 flex w-full justify-between">
        <div className="flex flex-col">
          <span className="text-gray-500">CLIENT</span>
          <span className="font-medium">
            {workOrder.customerWorkOrder?.customerName || 'No especificada'}
          </span>
        </div>
        {workOrder.customerWorkOrder?.customerInstallationCode && (
          <>
            <div className="flex flex-col">
              <span className="text-gray-500">BOTIGA</span>
              <span className="font-medium">
                {workOrder.customerWorkOrder?.customerInstallationCode ||
                  'No especificada'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500">DIRECCIÓ</span>
              <span className="font-medium">
                {workOrder.customerWorkOrder?.customerInstallationAddress
                  ?.address || 'No especificada'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500">POBLACIÓ</span>
              <span className="font-medium">
                {workOrder.customerWorkOrder?.customerInstallationAddress
                  ?.city || 'No especificada'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Detalls de l'Ordre */}
    </div>
  );
};

export default CustomerDataCard;
