import { CustomerAddress } from 'app/interfaces/Customer';

interface CustomerInformationComponentProps {
  companyName: string;
  customerAddress: CustomerAddress;
}

export const CustomerInformationComponent = ({
  companyName,
  customerAddress,
}: CustomerInformationComponentProps) => {
  return (
    <div className="w-full p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-2">Informació de l'Empresa</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="font-medium">Nom:</label>
          <label>{companyName}</label>
        </div>
        <div className="flex flex-col">
          <label className="font-medium">Adreça:</label>
          <label>{customerAddress.address}</label>
        </div>
        <div className="flex flex-col">
          <label className="font-medium">Població:</label>
          <label>{customerAddress.city}</label>
        </div>
        <div className="flex flex-col">
          <label className="font-medium">Codi Postal:</label>
          <label>{customerAddress.postalCode}</label>
        </div>
        <div className="flex flex-col">
          <label className="font-medium">Província:</label>
          <label>{customerAddress.province}</label>
        </div>
      </div>
    </div>
  );
};
