import React from 'react';
import Operator from 'app/interfaces/Operator';
import WorkOrder, {
  StateWorkOrder,
  WorkOrderCommentType,
  WorkOrderOperatorTimes,
  WorkOrderOperatorTimeType,
} from 'app/interfaces/workOrder';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { OperatorTimesDisplay } from './OperatorTimesSection';

dayjs.extend(utc);
dayjs.extend(timezone);

interface ReportDataCardProps {
  workOrder: WorkOrder;
}

const ReportDataCard: React.FC<ReportDataCardProps> = ({ workOrder }) => {
  const externalComments =
    workOrder.workOrderComments
      ?.filter(x => x.type === WorkOrderCommentType.External)
      .map(x => x.comment)
      .join('\n') || 'No especificat';

  const spareParts =
    workOrder.workOrderSpareParts
      ?.map(x => x.sparePart.description)
      .join('\n') || 'No especificat';

  const notFinishedComments =
    workOrder.workOrderComments
      ?.filter(x => x.type === WorkOrderCommentType.NoFinished)
      .map(x => x.comment)
      .join('\n') || 'No especificat';

  const internalComments =
    workOrder.workOrderComments
      ?.filter(x => x.type === WorkOrderCommentType.Internal)
      .map(x => x.comment)
      .join('\n') || '';

  return (
    <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
      <div className="">
        <div className="flex border-b border-gray-200 py-2">
          <div className="w-1/4 font-medium text-gray-700">OBJECTE</div>
          <div className="w-3/4 text-gray-600">
            {workOrder.asset?.description || 'No especificat'}
          </div>
        </div>

        <div className="flex border-b border-gray-200 py-2">
          <div className="w-1/4 font-medium text-gray-700">AVÍS</div>
          <div className="w-3/4 text-gray-600 whitespace-pre-line">
            {workOrder.description || 'No especificat'}
          </div>
        </div>

        <div className="flex border-b border-gray-200 py-2">
          <div className="w-1/4 font-medium text-gray-700">
            DESCRIPCIÓ REPARACIÓ
          </div>
          <div className="w-3/4 text-gray-600 whitespace-pre-line">
            {externalComments}
          </div>
        </div>

        <div className="flex border-b border-gray-200 py-2">
          <div className="w-1/4 font-medium text-gray-700">MATERIAL</div>
          <div className="w-3/4 text-gray-600 whitespace-pre-line">
            {spareParts}
          </div>
        </div>

        <div className="flex py-2 flex-col ">
          <div className="w-full text-gray-600">
            {(() => {
              const timesByOperator = workOrder.workOrderOperatorTimes?.reduce(
                (acc, time) => {
                  const operatorId = time.operator.id || 'unknown';

                  if (!acc[operatorId]) {
                    acc[operatorId] = {
                      operator: time.operator,
                      travelTimes: [],
                      workTimes: [],
                    };
                  }

                  if (time.type === WorkOrderOperatorTimeType.Travel) {
                    acc[operatorId].travelTimes.push(time);
                  } else if (time.type === WorkOrderOperatorTimeType.Time) {
                    acc[operatorId].workTimes.push(time);
                  }

                  return acc;
                },
                {} as {
                  [key: string]: {
                    operator: Operator;
                    travelTimes: WorkOrderOperatorTimes[];
                    workTimes: WorkOrderOperatorTimes[];
                  };
                }
              );

              return (
                <OperatorTimesDisplay timesByOperator={timesByOperator || {}} />
              );
            })()}
          </div>
        </div>

        <div className="flex border-b border-gray-200 py-2">
          <div className="w-1/4 font-medium text-gray-700">DATA</div>
          <div className="w-3/4 text-gray-600">
            {workOrder.creationTime
              ? dayjs(workOrder.creationTime).format('DD/MM/YYYY')
              : 'No especificada'}
          </div>
        </div>

        {/* Sección condicional para no finalización */}
        {workOrder.stateWorkOrder === StateWorkOrder.NotFinished && (
          <div className="flex border-b border-yellow-200 py-2">
            <div className="w-1/4 font-medium text-yellow-700">
              MOTIU DE NO FINALITZACIÓ
            </div>
            <div className="w-3/4 text-yellow-700 whitespace-pre-line">
              {notFinishedComments}
            </div>
          </div>
        )}

        <div className="flex">
          <div className="w-1/4 font-medium text-blue-700 py-2">
            OBSERVACIONS
          </div>
          <div className="w-3/4 text-blue-700 whitespace-pre-line">
            {internalComments}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDataCard;
