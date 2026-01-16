import { useTranslations } from 'app/hooks/useTranslations';

export interface ConsumedSparePartsChartProps {
  sparePart: string;
  number: number;
}

export default function ConsumedsSparePart({
  chartConsumedSpareParts,
}: {
  chartConsumedSpareParts: ConsumedSparePartsChartProps[];
}) {
  const { t } = useTranslations();

  return (
    <div>
      <p className="text-lg font-semibold mb-4 items-center w-full">
        {t('top.equipment.most.work.orders.month')}
      </p>
      <ul className="grid grid-rows-3 gap-4 w-full">
        {chartConsumedSpareParts.map((asset, index) => (
          <li
            key={index}
            className="bg-gray-100 p-4 rounded-md shadow-md flex justify-between items-center gap-4"
          >
            <div>
              <span className="text-lg font-semibold">{asset.sparePart}</span>
              <span className="block text-sm text-gray-500">
                {t('total')}: {asset.number}
              </span>
            </div>
            {index === 0 && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                {t('first')}
              </span>
            )}
            {index === 1 && (
              <span className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                {t('second')}
              </span>
            )}
            {index === 2 && (
              <span className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                {t('third')}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
