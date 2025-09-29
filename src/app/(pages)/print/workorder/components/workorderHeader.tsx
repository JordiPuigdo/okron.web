import Company from 'app/interfaces/Company';
import { SystemConfiguration } from 'app/interfaces/Config';
import WorkOrder from 'app/interfaces/workOrder';
import dayjs from 'dayjs';

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
      <div className="flex justify-between items-end ">
        <div className="w-96 relative ">
          <img src={company.urlLogo} alt={company.name} className="w-96 h-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-gray-200">
          <div className="text-center p-2 bg-gray-100 rounded-md align-bottom">
            <p className="text-xs font-medium text-gray-600">Número d'Ordre</p>
            <p className="text-lg font-bold text-gray-800">{workOrder.code}</p>
          </div>
          <div className="text-center p-2 bg-gray-100 rounded-md">
            <p className="text-xs font-medium text-gray-600">Data</p>
            <p className="text-lg font-bold text-gray-800">
              {dayjs(workOrder.creationTime).format('DD/MM/YYYY')}
            </p>
          </div>
        </div>
      </div>

      {company && config.isCRM && (
        <div className="flex justify-between">
          <CompanyInformationHeader company={company} />
          <div className=" items-end flex w-[140px]">
            <div className="bg-blue-50 p-2 m-2 rounded-lg border text-gray-600 flex w-full border-blue-100 justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">REF. CLIENT</span>
                <span className="font-bold text-blue-600 text-lg">
                  {workOrder.refCustomerId}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <CustomerDataCard workOrder={workOrder} isCRM={config.isCRM} />
    </div>
  );
};
