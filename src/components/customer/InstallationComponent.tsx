import { CustomerInstallations } from 'app/interfaces/Customer';

interface InstallationComponentProps {
  installation: CustomerInstallations;
}

export const InstallationComponent = ({
  installation,
}: InstallationComponentProps) => {
  return (
    <div className="w-full p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-2">
        Instal·lació Client - {installation.code}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span className="font-medium">Adreça:</span>{' '}
          {installation.address.address}
        </div>
        <div>
          <span className="font-medium">Ciutat:</span>{' '}
          {installation.address.city}
        </div>
        <div>
          <span className="font-medium">Codi Postal:</span>{' '}
          {installation.address.postalCode}
        </div>
        <div>
          <span className="font-medium">Província:</span>{' '}
          {installation.address.province}
        </div>
      </div>
    </div>
  );
};
