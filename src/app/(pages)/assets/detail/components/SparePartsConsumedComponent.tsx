'use client';

import { useState } from 'react';
import { useSparePartsHook } from 'app/hooks/useSparePartsHook';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import { SparePartsConsumedsReport } from 'app/interfaces/SparePart';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

interface SparePartsConsumedsComponentProps {
  assetId: string;
}
const SparePartsConsumedsComponent = ({
  assetId,
}: SparePartsConsumedsComponentProps) => {
  const { t } = useTranslations();
  const [from, setFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 90);
    return date;
  });
  const [to, setTo] = useState(new Date());
  const router = useRouter();
  const { sparePartsConsumeds, isLoading, isError } =
    useSparePartsHook().fetchSparePartsConsumedsHook(
      dayjs(from).format('YYYY-MM-DDTHH:mm:ss'),
      dayjs(to).format('YYYY-MM-DDTHH:mm:ss'),
      assetId
    );

  const [isLoadingWO, setIsLoadingWO] = useState<string | undefined>(undefined);
  const handleClickWorkOrder = (id: string) => {
    setIsLoadingWO(id);
    router.push(`/print/workorder?id=${id}`);
  };

  if (isLoading)
    return (
      <div className="text-center text-gray-500">
        <SvgSpinner />
      </div>
    );
  if (isError)
    return (
      <div className="text-center text-red-500">
        {t('error.contact.admin')}
      </div>
    );
  if (!sparePartsConsumeds?.length)
    return (
      <div className="text-center text-gray-500">
        {t('no.spare.parts.used')}
      </div>
    );

  return (
    <div className="space-y-4">
      {sparePartsConsumeds.map(
        (item: SparePartsConsumedsReport, index: number) => (
          <div
            key={index + item.workOrderId}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
            onClick={() => handleClickWorkOrder(item.workOrderId)}
          >
            <div className="text-xs text-gray-400 mb-1">
              {dayjs(item.date).format('DD/MM/YYYY HH:mm')}
            </div>

            <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              {item.sparePartCode} - {item.sparePartDescription}{' '}
              {isLoadingWO == item.workOrderId && (
                <SvgSpinner className="text-okron-main" />
              )}
            </div>

            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">{t('common.quantity')}:</span>{' '}
              {item.sparePartNumber}
            </div>

            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">{t('work.order')}:</span>{' '}
              {item.workOrderCode} - {item.workOrderDescription}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default SparePartsConsumedsComponent;
