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

        <div className="flex border-b border-gray-200 py-2">
          <div className="w-1/4 font-medium text-gray-700">HORES TÈCNICS</div>
          <div className="w-3/4 text-gray-600">
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

interface OperatorTimesProps {
  timesByOperator: {
    [key: string]: {
      operator: Operator;
      travelTimes: WorkOrderOperatorTimes[];
      workTimes: WorkOrderOperatorTimes[];
    };
  };
}

const OperatorTimesDisplay: React.FC<OperatorTimesProps> = ({
  timesByOperator,
}) => {
  if (Object.keys(timesByOperator).length === 0) {
    return <span>No especificat</span>;
  }

  return (
    <div className="space-y-2">
      {Object.values(timesByOperator).map((operatorData, index) => (
        <OperatorLine key={index} operatorData={operatorData} />
      ))}
    </div>
  );
};

// Función utilitaria para obtener la fecha mínima
const getEarliestDate = (
  times: WorkOrderOperatorTimes[],
  field: 'startTime' | 'endTime'
): Date | null => {
  if (times.length === 0) return null;

  return times.reduce((earliest: Date | null, current) => {
    if (!current[field]) return earliest;
    if (!earliest) return new Date(current[field]!);
    return new Date(current[field]!) < earliest
      ? new Date(current[field]!)
      : earliest;
  }, null);
};

// Función utilitaria para obtener la fecha máxima
const getLatestDate = (
  times: WorkOrderOperatorTimes[],
  field: 'startTime' | 'endTime'
): Date | null => {
  if (times.length === 0) return null;

  return times.reduce((latest: Date | null, current) => {
    if (!current[field]) return latest;
    if (!latest) return new Date(current[field]!);
    return new Date(current[field]!) > latest
      ? new Date(current[field]!)
      : latest;
  }, null);
};

const OperatorLine: React.FC<{ operatorData: any }> = ({ operatorData }) => {
  const { operator, travelTimes, workTimes } = operatorData;

  const earliestTravelStart = getEarliestDate(travelTimes, 'startTime');
  const latestTravelEnd = getLatestDate(travelTimes, 'endTime');
  const workTime = workTimes.length > 0 ? workTimes[0] : null;

  const parts: string[] = [];

  if (earliestTravelStart) {
    parts.push(
      `Inici desplaçament ${dayjs(earliestTravelStart).format('HH:mm')}`
    );
  }

  if (workTime?.startTime) {
    parts.push(`Inici treball ${dayjs(workTime.startTime).format('HH:mm')}`);
  }

  if (workTime?.endTime) {
    parts.push(`Fi treball ${dayjs(workTime.endTime).format('HH:mm')}`);
  }

  if (latestTravelEnd) {
    parts.push(`Fi desplaçament ${dayjs(latestTravelEnd).format('HH:mm')}`);
  }

  return (
    <div className="flex flex-col">
      <span className="font-medium text-gray-900">{operator.name}:</span>
      <span className="text-gray-600">{parts.join(' · ')}</span>
    </div>
  );
};
