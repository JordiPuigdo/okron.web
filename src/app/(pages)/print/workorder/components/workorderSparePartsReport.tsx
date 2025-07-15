import WorkOrder from 'app/interfaces/workOrder';
import { formatDate } from 'app/utils/utils';

export const WorkOrderSparePartsReport = ({
  workorder,
}: {
  workorder: WorkOrder;
}) => {
  return (
    <div className="flex flex-col p-4 no-break ">
      <div className="w-full rounded-lg border border-gray-200 shadow-sm">
        {/* Table Header - now uses exact fractional widths */}
        <div className="bg-gray-50 grid grid-cols-[3fr_2fr_2fr_2fr_1fr] p-3 text-l font-semibold  text-gray-700">
          <p>Recanvi</p>
          <p className="text-right pr-12">Qtt</p>
          <p>Data</p>
          <p>Magatzem</p>
          <p className="flex justify-end pr-2">Operari</p>
        </div>

        {!workorder.workOrderSpareParts?.length ? (
          <div className="p-4 text-center text-gray-500">
            No hi ha recanvis registrats
          </div>
        ) : (
          workorder.workOrderSpareParts.map((sparePart, index) => (
            <div
              key={index}
              className={`grid grid-cols-[3fr_2fr_2fr_2fr_1fr] p-3 items-center text-sm border-b`}
              aria-label={`Recanvi: ${sparePart.sparePart?.description}`}
            >
              <p
                className="text-gray-800"
                title={sparePart.sparePart?.description}
              >
                {sparePart.sparePart?.description || '-'}
              </p>

              <p className="text-gray-600 text-right pr-12">
                {sparePart.quantity || '-'}
              </p>

              {/* Date */}
              <p className="text-gray-500">
                {formatDate(sparePart.creationDate)}
              </p>

              {/* Warehouse with truncation */}
              <p
                className="text-gray-500 truncate pr-2"
                title={sparePart.warehouseName}
              >
                {sparePart.warehouseName || '-'}
              </p>

              {/* Operator name */}
              <p
                className="text-gray-500 flex justify-end text-end pr-2"
                title={sparePart.operator?.name}
              >
                {sparePart.operator?.name || '-'}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
