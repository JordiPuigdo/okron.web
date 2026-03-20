import { Budget } from 'app/interfaces/Budget';
import { SystemConfiguration } from 'app/interfaces/Config';
import dayjs from 'dayjs';

import { CompanyInformationHeader } from '../../components/CompanyInformationHeader';

export const AssemblyBudgetPrintHeader = ({
  budget,
  config,
}: {
  budget: Budget;
  config: SystemConfiguration;
}) => {
  const company = config.company;

  return (
    <div className="rounded-lg border border-gray-200 print:border-0 print:p-2">
      <div className="flex justify-between items-end pb-4">
        <div className="w-48 h-16 relative">
          <img
            src={company.urlLogo}
            alt={company.name}
            className="object-contain object-left"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-gray-200">
          <div className="text-center p-2 bg-blue-50 rounded-md align-bottom">
            <p className="text-xs font-medium text-gray-600">
              Pressupost Montatge
            </p>
            <p className="text-lg font-bold text-gray-800">
              {budget.code}
            </p>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-md">
            <p className="text-xs font-medium text-gray-600">Data</p>
            <p className="text-lg font-bold text-gray-800">
              {dayjs(budget.budgetDate).format('DD/MM/YYYY')}
            </p>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-md">
            <p className="text-xs font-medium text-gray-600">Vàlid fins</p>
            <p className="text-lg font-bold text-gray-800">
              {dayjs(budget.validUntil).format('DD/MM/YYYY')}
            </p>
          </div>
        </div>
      </div>

      <CompanyInformationHeader company={company} />

      <div className="flex flex-col border-t-2 border-blue-200 border-b-2">
        <div className="flex flex-col flex-grow justify-between">
          <div className="space-y-2">
            <p className="font-medium text-gray-900">
              {budget.companyName}
            </p>
          </div>

          {budget.customerAddress && (
            <div className="text-sm text-gray-700 space-y-1">
              <p className="flex">
                <span className="line-clamp-2">
                  {budget.customerAddress.address}
                </span>
              </p>
              <p>
                {budget.customerAddress.postalCode},{' '}
                {budget.customerAddress.city}
              </p>
              <p>{budget.customerAddress.province}</p>
            </div>
          )}

          <div>
            {budget.customerNif && (
              <p className="text-sm text-gray-600">{budget.customerNif}</p>
            )}
            {budget.customerPhone && (
              <p className="text-sm text-gray-600">
                {budget.customerPhone}
              </p>
            )}
            {budget.customerEmail && (
              <p className="text-sm text-gray-600 break-all">
                {budget.customerEmail}
              </p>
            )}
          </div>
        </div>
      </div>

      {budget.title && (
        <div className="mt-2 text-sm text-gray-700">
          <span className="font-medium">Títol: </span>
          {budget.title}
        </div>
      )}
    </div>
  );
};
