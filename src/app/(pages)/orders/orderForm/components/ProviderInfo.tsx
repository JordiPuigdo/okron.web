import { Provider } from 'app/interfaces/Provider';

interface ProviderInfoProps {
  provider: Provider | undefined;
}

const ProviderInfo: React.FC<ProviderInfoProps> = ({ provider }) => {
  return (
    <div className="flex felx-col gap-4 justify-between border rounded-xl p-2">
      <div className="flex flex-col gap-y-2">
        <div className="flex justify-between gap-4">
          <div className="text-sm font-medium text-gray-900">Proveeïdor:</div>
          <div className="text-sm text-gray-500">{provider?.name}</div>
        </div>
        <div className="flex justify-between gap-4">
          <div className="text-sm font-medium text-gray-900">Adreça:</div>
          <div className="text-sm text-gray-500">
            {provider?.address} - {provider?.city}
          </div>
        </div>
      </div>
      <div>
        <div className="flex justify-between gap-4">
          <div className="text-sm font-medium text-gray-900">Ciutat:</div>
          <div className="text-sm text-gray-500">{provider?.city}</div>
        </div>
        <div className="flex justify-between gap-4">
          <div className="text-sm font-medium text-gray-900">Codi Postal:</div>
          <div className="text-sm text-gray-500">{provider?.postalCode}</div>
        </div>
      </div>
      <div>
        <div className="flex justify-between gap-4">
          <div className="text-sm font-medium text-gray-900">NIE:</div>
          <div className="text-sm text-gray-500">{provider?.nie}</div>
        </div>
        <div className="flex justify-between gap-4">
          <div className="text-sm font-medium text-gray-900">Telèfon:</div>
          <div className="text-sm text-gray-500">{provider?.phoneNumber}</div>
        </div>
      </div>
    </div>
  );
};

export default ProviderInfo;
