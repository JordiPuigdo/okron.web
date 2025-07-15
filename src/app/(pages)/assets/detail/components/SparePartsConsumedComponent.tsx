'use client';

import { useState } from 'react';
import { useSparePartsHook } from 'app/hooks/useSparePartsHook';
import { SparePartsConsumedsReport } from 'app/interfaces/SparePart';
import dayjs from 'dayjs';

interface SparePartsConsumedsComponentProps {
  assetId: string;
}
const SparePartsConsumedsComponent = ({
  assetId,
}: SparePartsConsumedsComponentProps) => {
  const [from, setFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 90);
    return date;
  });
  const [to, setTo] = useState(new Date());

  const { sparePartsConsumeds, isLoading, isError } =
    useSparePartsHook().fetchSparePartsConsumedsHook(
      dayjs(from).format('YYYY-MM-DDTHH:mm:ss'),
      dayjs(to).format('YYYY-MM-DDTHH:mm:ss'),
      assetId
    );

  if (isLoading)
    return <div className="text-center text-gray-500">Cargando...</div>;
  if (isError)
    return (
      <div className="text-center text-red-500">
        Error al cargar los repuestos.
      </div>
    );
  if (!sparePartsConsumeds?.length)
    return (
      <div className="text-center text-gray-500">
        No hay repuestos utilizados.
      </div>
    );

  return (
    <div className="space-y-4">
      {sparePartsConsumeds.map(
        (item: SparePartsConsumedsReport, index: number) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
          >
            <div className="text-xs text-gray-400 mb-1">
              {dayjs(item.date).format('DD/MM/YYYY HH:mm')}
            </div>

            <div className="text-sm font-semibold text-gray-800">
              {item.sparePartCode} - {item.sparePartDescription}
            </div>

            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Quantitat:</span>{' '}
              {item.sparePartNumber}
            </div>

            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Ordre de treball:</span>{' '}
              {item.workOrderCode} - {item.workOrderDescription}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default SparePartsConsumedsComponent;
