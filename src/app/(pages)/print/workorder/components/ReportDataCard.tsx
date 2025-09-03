import React from 'react';
import Operator from 'app/interfaces/Operator';
import WorkOrder, {
  StateWorkOrder,
  WorkOrderCommentType,
  WorkOrderOperatorTimes,
  WorkOrderOperatorTimeType,
} from 'app/interfaces/workOrder';
import dayjs from 'dayjs';

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

  const workers = workOrder.operator?.map(x => x.name).join(', ');

  return (
    <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
      <div className="space-y-4">
        <div className="flex border-b border-gray-200 pb-3">
          <div className="w-1/4 font-medium text-gray-700">OBJECTE</div>
          <div className="w-3/4 text-gray-600">
            {workOrder.asset?.description || 'No especificat'}
          </div>
        </div>

        <div className="flex border-b border-gray-200 pb-3">
          <div className="w-1/4 font-medium text-gray-700">AVÍS</div>
          <div className="w-3/4 text-gray-600 whitespace-pre-line">
            {workOrder.description || 'No especificat'}
          </div>
        </div>

        <div className="flex border-b border-gray-200 pb-3">
          <div className="w-1/4 font-medium text-gray-700">
            DESCRIPCIÓ REPARACIÓ
          </div>
          <div className="w-3/4 text-gray-600 whitespace-pre-line">
            {externalComments}
          </div>
        </div>

        <div className="flex border-b border-gray-200 pb-3">
          <div className="w-1/4 font-medium text-gray-700">MATERIAL</div>
          <div className="w-3/4 text-gray-600 whitespace-pre-line">
            {spareParts}
          </div>
        </div>

        <div className="flex border-b border-gray-200 pb-3">
          <div className="w-1/4 font-medium text-gray-700">HORES</div>
          <div className="w-3/4 text-gray-600">
            {(() => {
              // Agrupar tiempos por operario
              const timesByOperator: {
                [key: string]: {
                  operator: Operator;
                  travelTimes: WorkOrderOperatorTimes[];
                  workTimes: WorkOrderOperatorTimes[];
                };
              } = {};

              workOrder.workOrderOperatorTimes?.forEach(time => {
                const operatorId = time.operator.id || 'unknown';

                if (!timesByOperator[operatorId]) {
                  timesByOperator[operatorId] = {
                    operator: time.operator,
                    travelTimes: [],
                    workTimes: [],
                  };
                }

                if (time.type === WorkOrderOperatorTimeType.Travel) {
                  timesByOperator[operatorId].travelTimes.push(time);
                } else if (time.type === WorkOrderOperatorTimeType.Time) {
                  timesByOperator[operatorId].workTimes.push(time);
                }
              });

              // Si no hay tiempos
              if (Object.keys(timesByOperator).length === 0) {
                return 'No especificat';
              }

              // Construir el texto para cada operario
              let result = '';

              Object.values(timesByOperator).forEach((operatorData, index) => {
                const { operator, travelTimes, workTimes } = operatorData;

                const travelTime =
                  travelTimes.length > 0 ? travelTimes[0] : null;
                const workTime = workTimes.length > 0 ? workTimes[0] : null;

                if (index > 0) result += '\n';
                //result += `${operator.name}: `;

                const parts: string[] = [];

                if (travelTime?.startTime) {
                  parts.push(
                    `Inici desplaçament ${dayjs(travelTime.startTime).format(
                      'HH:mm'
                    )}`
                  );
                }

                if (workTime?.startTime) {
                  parts.push(
                    `Inici treball ${dayjs(workTime.startTime).format('HH:mm')}`
                  );
                }

                if (workTime?.endTime) {
                  parts.push(
                    `Fi treball ${dayjs(workTime.endTime).format('HH:mm')}`
                  );
                }

                if (travelTime?.endTime) {
                  parts.push(
                    `Fi desplaçament ${dayjs(travelTime.endTime).format(
                      'HH:mm'
                    )}`
                  );
                }

                result += parts.join(' · ');
              });

              return result;
            })()}
          </div>
        </div>

        <div className="flex border-b border-gray-200 pb-3">
          <div className="w-1/4 font-medium text-gray-700">NOM TÈCNICS</div>
          <div className="w-3/4 text-gray-600">
            {workers || 'No especificat'}
          </div>
        </div>

        <div className="flex border-b border-gray-200 pb-3">
          <div className="w-1/4 font-medium text-gray-700">DATA</div>
          <div className="w-3/4 text-gray-600">
            {workOrder.startTime
              ? dayjs(workOrder.startTime).format('DD/MM/YYYY')
              : 'No especificada'}
          </div>
        </div>

        {/* Sección condicional para no finalización */}
        {workOrder.stateWorkOrder === StateWorkOrder.NotFinished && (
          <div className="flex border-b border-yellow-200 pb-3">
            <div className="w-1/4 font-medium text-yellow-700">
              MOTIU DE NO FINALITZACIÓ
            </div>
            <div className="w-3/4 text-yellow-700 whitespace-pre-line">
              {notFinishedComments}
            </div>
          </div>
        )}

        <div className="flex">
          <div className="w-1/4 font-medium text-blue-700">OBSERVACIONS</div>
          <div className="w-3/4 text-blue-700 whitespace-pre-line">
            {internalComments}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDataCard;
