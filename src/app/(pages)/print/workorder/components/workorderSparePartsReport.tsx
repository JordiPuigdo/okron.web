import WorkOrder from 'app/interfaces/workOrder';
import { formatDate } from 'app/utils/utils';

export const WorkOrderSparePartsReport = ({
  workorder,
}: {
  workorder: WorkOrder;
}) => {
  return (
    <div className="flex flex-col p-6 ">
      <div className="w-[120px]">
        <h2 className="text-xl font-semibold text-gray-800 border p-2 rounded-xl">
          Recanvis
        </h2>
      </div>

      <div className="w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        {/* Table Header - now uses exact fractional widths */}
        <div className="bg-gray-50 grid grid-cols-[3fr_2fr_2fr_2fr_1fr] p-3 font-medium text-gray-700">
          <p>Recanvi</p>
          <p className="text-right pr-4">Quantitat</p>
          <p>Data</p>
          <p>Magatzem</p>
          <p>Operari</p>
        </div>

        {/* Empty State */}
        {!workorder.workOrderSpareParts?.length ? (
          <div className="p-4 text-center text-gray-500">
            No hi ha recanvis registrats
          </div>
        ) : (
          /* Spare Parts List */
          workorder.workOrderSpareParts.map((sparePart, index) => (
            <div
              key={index}
              className={`grid grid-cols-[3fr_2fr_2fr_2fr_1fr] p-3 items-center border-b`}
              aria-label={`Recanvi: ${sparePart.sparePart?.description}`}
            >
              {/* Spare Part Name with truncation */}
              <p
                className="text-gray-800 font-medium truncate pr-2"
                title={sparePart.sparePart?.description}
              >
                {sparePart.sparePart?.description || '-'}
              </p>

              {/* Quantity - right aligned */}
              <p className="text-gray-600 text-right pr-4">
                {sparePart.quantity || '-'}
              </p>

              {/* Date */}
              <p className="text-gray-500 text-sm">
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
                className="text-gray-500 truncate"
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
