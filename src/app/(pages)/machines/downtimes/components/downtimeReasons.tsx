import { useState } from 'react';
import {
  DowntimesReasons,
  DowntimesReasonsRequest,
} from 'app/interfaces/Production/Downtimes';
import DowntimesService from 'app/services/downtimesService';

interface UseCreateDowntimeReasonProps {
  machineId?: string;
  assetId?: string;
  onSuccess?: (downtime: DowntimesReasons) => void;
  onError?: (error: Error) => void;
}

export const useCreateDowntimeReason = ({
  assetId,
  machineId,
  onSuccess,
  onError,
}: UseCreateDowntimeReasonProps) => {
  const downtimeReasonsService = new DowntimesService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );

  const [formValues, setFormValues] = useState<DowntimesReasonsRequest>({
    assetId: assetId,
    machineId: machineId,
    description: '',
    downTimeType: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    const updatedValue = name === 'downTimeType' ? parseInt(value, 10) : value;

    setFormValues(prevValues => ({ ...prevValues, [name]: updatedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const downtime = await downtimeReasonsService.createDowntimesReason(
        formValues
      );
      setFormValues({
        assetId: downtime.assetId,
        machineId: downtime.machineId,
        description: '',
        downTimeType: downtime.downTimeType,
      });
      if (onSuccess) onSuccess(downtime);
    } catch (error) {
      if (onError) onError(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formValues,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
};
