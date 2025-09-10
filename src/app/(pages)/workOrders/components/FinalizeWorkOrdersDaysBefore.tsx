'use client';

import { useState } from 'react';
import { SvgSpinner } from 'app/icons/icons';
import { UserPermission } from 'app/interfaces/User';
import { workOrderService } from 'app/services/workOrderService';
import { useSessionStore } from 'app/stores/globalStore';
import { Button } from 'designSystem/Button/Buttons';

import { useTranslations } from '../../../hooks/useTranslations';

interface FinalizeWorkOrdersDaysBeforeProps {
  onFinalizeWorkOrdersDayBefore?: () => void;
}

const FinalizeWorkOrdersDaysBefore: React.FC<
  FinalizeWorkOrdersDaysBeforeProps
> = ({ onFinalizeWorkOrdersDayBefore }) => {
  const { loginUser } = useSessionStore(state => state);

  const [isLoading, setIsLoading] = useState(false);
  const {t} = useTranslations();
  const handleFinalizeWorkOrdersDayBefore = async () => {
    const isConfirmed = window.confirm(
      'Segur que voleu finalitzar totes les ordres de treball pendents?'
    );
    if (!isConfirmed) return;

    setIsLoading(true);
    const today = new Date();
    await workOrderService.finishWorkOrdersByDate(today);
    if (onFinalizeWorkOrdersDayBefore) onFinalizeWorkOrdersDayBefore();
    setIsLoading(false);
  };

  if (loginUser?.permission != UserPermission.Administrator) return <></>;
  return (
    <div className="flex items-center">
      <Button
        customStyles="bg-okron-main text-sm sm:text-xs text-white rounded-md md:text-sm lg:text-base font-semibold hover:bg-okron-hoverButtonMain jw-full overflow-hidden text-ellipsis whitespace-nowrap"
        onClick={() => handleFinalizeWorkOrdersDayBefore()}
      >
        {t('finalize.orders')}{isLoading && <SvgSpinner />}
      </Button>
    </div>
  );
};

export default FinalizeWorkOrdersDaysBefore;
