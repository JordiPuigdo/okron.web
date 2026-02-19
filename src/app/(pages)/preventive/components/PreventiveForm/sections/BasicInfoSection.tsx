import { UseFormRegister } from 'react-hook-form';
import { ContentCard } from 'app/(pages)/workOrders/[id]/components/WorkOrderForm/layout/ContentCard';
import { Preventive } from 'app/interfaces/Preventive';

interface BasicInfoSectionProps {
  register: UseFormRegister<Preventive>;
  isDisabled?: boolean;
}

export function BasicInfoSection({
  register,
  isDisabled = false,
}: BasicInfoSectionProps) {
  return (
    <ContentCard>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            className="block text-gray-700 font-bold mb-2 text-sm"
            htmlFor="code"
          >
            Codi
          </label>
          <input
            {...register('code')}
            id="code"
            type="text"
            disabled={isDisabled}
            className="form-input border border-gray-300 rounded-md w-full p-2 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label
            className="block text-gray-700 font-bold mb-2 text-sm"
            htmlFor="description"
          >
            Descripció
          </label>
          <input
            {...register('description')}
            id="description"
            type="text"
            disabled={isDisabled}
            className="form-input border border-gray-300 rounded-md w-full p-2 disabled:bg-gray-100"
          />
        </div>
      </div>
    </ContentCard>
  );
}
