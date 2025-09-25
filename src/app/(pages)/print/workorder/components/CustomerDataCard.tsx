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
    <div className="flex gap-6">
      {/* Datos del Cliente */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col w-full">
        <div className="space-y-2 text-gray-600 flex gap-6 justify-between">
          <div className="flex flex-col mx-4">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">DIRECCIÓ</span>
              <span className="font-medium">
                {workOrder.customerWorkOrder?.customerAddress?.address ||
                  'No especificada'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">CP</span>
              <span className="font-medium">
                {workOrder.customerWorkOrder?.customerAddress?.postalCode ||
                  'No especificat'}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-gray-500">NIF</span>
              <span className="font-medium">
                {workOrder.customerWorkOrder?.customerNif}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-gray-500">CORREU ELECTRÒNIC</span>
              <span className="font-medium">
                {workOrder.customerWorkOrder?.customerEmail}
              </span>
            </div>
          </div>
          <div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">POBLACIÓ</span>
              <span className="font-medium">
                {workOrder.customerWorkOrder?.customerAddress?.city ||
                  'No especificada'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">PROVINCIA</span>
              <span className="font-medium">
                {workOrder.customerWorkOrder?.customerAddress?.province ||
                  'No especificada'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">TELÈFON</span>
              <span className="font-medium">
                {workOrder.customerWorkOrder?.customerPhone || '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Botiga */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col w-[50%]">
        <div className="space-y-2 text-gray-600">
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
      </div>

      {/* Detalls de l'Ordre */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col w-[50%]">
        <div className="space-y-3 text-gray-600">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">NÚM ORDRE</span>
            <span className="font-medium">{workOrder.code}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">DATA</span>
            <span className="font-medium">
              {dayjs(workOrder.creationDate).format('DD/MM/YYYY')}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">REF. CLIENT</span>
            <span className="font-bold text-blue-600 text-lg">
              {workOrder.refCustomerId}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDataCard;
