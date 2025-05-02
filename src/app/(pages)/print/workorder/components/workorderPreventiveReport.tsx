import WorkOrder from 'app/interfaces/workOrder';

export const WorkOrderPreventiveReport = ({
  workorder,
}: {
  workorder: WorkOrder;
}) => {
  return (
    <div className="flex flex-col p-6">
      <div className="w-[150px]">
        <h2 className="text-xl font-semibold text-gray-800 border p-2 rounded-xl">
          Preventiu
        </h2>
      </div>

      <div className="w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        {/* Header row */}
        <div className="bg-gray-50 grid grid-cols-[3fr_1fr] p-3 font-medium text-gray-700">
          <p>Punt d'Inspecció</p>
          <p className="text-right pr-4">Resultat</p>
        </div>

        {/* Empty State */}
        {!workorder.workOrderInspectionPoint?.length ? (
          <div className="p-4 text-center text-gray-500">
            No hi ha punts d'inspecció registrats
          </div>
        ) : (
          /* Inspection Points List */
          workorder.workOrderInspectionPoint.map((inspectionPoints, index) => (
            <div
              key={index}
              className={`grid grid-cols-[3fr_1fr] p-3 items-center border-b border-gray-100`}
              aria-label={`Punt d'inspecció: ${inspectionPoints.inspectionPoint.description}`}
            >
              <p
                className="text-gray-800 font-medium truncate pr-2"
                title={inspectionPoints.inspectionPoint.description}
              >
                {inspectionPoints.inspectionPoint.description}
              </p>
              <div className="flex justify-end pr-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    inspectionPoints.check
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {inspectionPoints.check ? 'OK' : 'KO'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
