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
      <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src={company.urlLogo}
            alt={company.name}
            className="h-20 w-auto object-contain"
          />
        </div>

        {/* Cards */}
        <div className="flex flex-wrap gap-4 ml-4">
          <div className="px-4 py-2 bg-gray-100 rounded-lg text-center min-w-[140px]">
            <p className="text-xs text-gray-500 font-medium">Número d'Ordre</p>
            <p className="text-xl font-bold text-gray-800 leading-tight">
              {workOrder.code}
            </p>
          </div>

          <div className="px-4 py-2 bg-gray-100 rounded-lg text-center min-w-[140px]">
            <p className="text-xs text-gray-500 font-medium">Data</p>
            <p className="text-xl font-bold text-gray-800 leading-tight">
              {dayjs(workOrder.creationTime).format('DD/MM/YYYY')}
            </p>
          </div>

          {!config.isCRM && (
            <div className="px-4 py-2 bg-gray-100 rounded-lg text-center min-w-[180px]">
              <p className="text-xs text-gray-500 font-medium">Equip</p>
              <p className="text-xl font-bold text-gray-800 leading-tight">
                {workOrder.asset?.description ?? ''}
              </p>
            </div>
          )}
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
