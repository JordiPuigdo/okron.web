import WorkOrder from 'app/interfaces/workOrder';
import { formatDate } from 'app/utils/utils';

export const WorkOrderComment = ({ workorder }: { workorder: WorkOrder }) => {
  return (
    <div className="flex flex-col p-4 no-break">
      <div className="w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-gray-50 hidden sm:grid grid-cols-[1fr_2fr_1fr] p-3 text-sm font-semibold text-gray-700">
          <p>Comentari</p>
          <p className="flex justify-end pr-2">Data</p>
          <p className="flex justify-end pr-2">Operari</p>
        </div>

        {!workorder.workOrderComments?.length ? (
          <div className="p-4 text-center text-gray-500">
            No hi ha comentaris registrats
          </div>
        ) : (
          workorder.workOrderComments.map((comment, index) => (
            <div
              key={index}
              className="grid sm:grid-cols-[1fr_2fr_1fr] grid-cols-1 gap-1 p-3 border-b text-sm"
            >
              <p className="text-gray-600">{comment.comment || '-'}</p>
              <p className="text-gray-500 sm:text-right">
                {formatDate(comment.creationDate)}
              </p>
              <p className="text-gray-500 sm:text-right">
                {comment.operator?.name || 'Sense nom'}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
