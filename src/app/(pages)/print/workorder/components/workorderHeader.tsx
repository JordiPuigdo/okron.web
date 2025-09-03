'use client';

import { useQueryParams } from 'app/hooks/useFilters';
import Company from 'app/interfaces/Company';
import { SystemConfiguration } from 'app/interfaces/Config';
import WorkOrder, { WorkOrderType } from 'app/interfaces/workOrder';
import { formatDate } from 'app/utils/utils';

import CustomerDataCard from './CustomerDataCard';

export const WorkOrderHeader = ({
  workOrder,
  config,
}: {
  workOrder: WorkOrder;
  config: SystemConfiguration;
}) => {
  const { getQueryParam } = useQueryParams();

  const urlLogo = getQueryParam('urlLogo')?.toString() || '';
  const company = config?.company as unknown as Company;
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center md:items-start gap-4 p-2">
        <div>
          <img src={urlLogo} className="w-34 h-24" />
        </div>
        {!config.isCRM && (
          <div className="flex flex-col items-end text-right">
            <h1 className="text-base font-bold">{workOrder.code}</h1>
            <p className="text-sm font-bold">{workOrder.description}</p>
            <p className="text-sm font-semibold">
              {workOrder.asset?.description}
            </p>
            <p className="text-sm font-semibold">
              {formatDate(workOrder.startTime, false)}
            </p>
            {workOrder.workOrderType === WorkOrderType.Preventive && (
              <p className="text-sm">{workOrder.preventive?.description}</p>
            )}
          </div>
        )}
      </div>

      {company && (
        <div className="flex flex-col items-start p-3 ">
          <p className="text-sm font-semibold">{company.name}</p>
          <p className="text-sm font-semibold">{company.address.address}</p>
          <div className="flex gap-2">
            <p className="text-sm font-semibold">
              {company.address.postalCode}
            </p>
            <p className="text-sm font-semibold">{company.address.city}</p>
            <p className="text-sm font-semibold">{company.address.province}</p>
          </div>
          <p className="text-sm font-semibold">{company.nif}</p>
          <p className="text-sm font-semibold">Tel: {company.phone}</p>
          <p className="text-sm font-semibold text-gray-500">{company.email}</p>
        </div>
      )}

      <CustomerDataCard workOrder={workOrder} isCRM={config.isCRM} />
    </div>
  );
};
