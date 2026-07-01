import Company from 'app/interfaces/Company';

export const CompanyInformationHeader = ({ company }: { company: Company }) => {
  return (
    <div className="flex p-2 w-full">
      {/* Company Information */}

      <div className="flex flex-col flex-grow">
        <p className="text-sm font-medium text-gray-900">
          {company.fiscalName}
        </p>

        <div className="text-xs text-gray-700">
          <p className="line-clamp-2">{company.address.address}</p>
          <p>
            {company.address.postalCode}, {company.address.city}
          </p>
          <p>{company.address.province}</p>
        </div>

        <div className="text-xs text-gray-600">
          <p>{company.nif}</p>
          <p>{company.phone}</p>
          <p className="break-all">{company.email}</p>
        </div>
      </div>
    </div>
  );
};
