import Company from 'app/interfaces/Company';
import { SystemConfiguration } from 'app/interfaces/Config';
import WorkOrder, { WorkOrderType } from 'app/interfaces/workOrder';
import { formatDate } from 'app/utils/utils';

import { CompanyInformationHeader } from '../../components/CompanyInformationHeader';
import CustomerDataCard from './CustomerDataCard';

export const WorkOrderHeader = ({
  workOrder,
  config,
}: {
  workOrder: WorkOrder;
  config: SystemConfiguration;
}) => {
  const company = config?.company as unknown as Company;
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center md:items-start gap-4 p-2">
        <div className="w-32">
          <img src={company.urlLogo} alt={company.name} />
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

      {company && config.isCRM && (
        <CompanyInformationHeader company={company} />
      )}

      <CustomerDataCard workOrder={workOrder} isCRM={config.isCRM} />
    </div>
  );
};
