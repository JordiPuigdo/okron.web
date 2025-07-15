import WorkOrder from 'app/interfaces/workOrder';
import { formatDate } from 'app/utils/utils';

export const WorkOrderComment = ({ workorder }: { workorder: WorkOrder }) => {
  return (
    <div className="flex flex-col p-4 no-break">
      <div className="w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-gray-50 grid grid-cols-[1fr_2fr_1fr] p-3 text-l font-semibold text-gray-700">
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
              className={`grid grid-cols-[1fr_2fr_1fr] p-3 items-center border-b text-sm border-gray-100`}
              aria-label={`Comentari de ${comment.operator?.name}`}
            >
              <p
                className="text-gray-600 line-clamp-2 hover:line-clamp-none transition-all"
                title={comment.comment}
              >
                {comment.comment || '-'}
              </p>
              <p className="text-gray-500 flex justify-end pr-2">
                {formatDate(comment.creationDate)}
              </p>
              <p
                className="text-gray-500 flex justify-end text-end pr-2"
                title={comment.operator?.name}
              >
                {comment.operator?.name || 'Sense nom'}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
