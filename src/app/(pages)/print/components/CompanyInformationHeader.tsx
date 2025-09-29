import Company from 'app/interfaces/Company';

export const CompanyInformationHeader = ({ company }: { company: Company }) => {
  return (
    <div className="flex pb-4 p-2 w-full">
      {/* Company Information */}

      <div className="flex flex-col flex-grow justify-between ">
        {/* Primera sección: Nombre de la empresa */}
        <div>
          <p className="font-medium text-gray-900">{company.fiscalName}</p>
        </div>

        {/* Segunda sección: Dirección completa */}
        <div className="text-sm text-gray-700 space-y-1">
          <p className="line-clamp-2">{company.address.address}</p>
          <p>
            {company.address.postalCode}, {company.address.city}
          </p>
          <p>{company.address.province}</p>
        </div>

        {/* Tercera sección: NIF y contacto (alineado al bottom) */}
        <div className="">
          <p className="text-sm text-gray-600">{company.nif}</p>
          <p className="text-sm text-gray-600">{company.phone}</p>
          <p className="text-sm text-gray-600 break-all">{company.email}</p>
        </div>
      </div>
    </div>
  );
};
