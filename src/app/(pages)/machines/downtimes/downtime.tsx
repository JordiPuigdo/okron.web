'use client';

import { useState } from 'react';
import { SvgCreate } from 'app/icons/icons';
import {
  DowntimesReasons,
  DowntimesReasonsType,
} from 'app/interfaces/Production/Downtimes';
import { translateDowntimeReasonType } from 'app/utils/utils';

import DownTimeReasonsConfigured from './components/downtimeConfigured';
import { useCreateDowntimeReason } from './components/downtimeReasons';

export interface DowntimesReasonsProps {
  assetId?: string;
  machineId?: string;
}

export default function Downtimes({
  assetId = '',
  machineId = '',
}: DowntimesReasonsProps) {
  return (
    <div className="w-full bg-white shadow-lg rounded-lg p-4 h-full">
      <div className="flex flex-col gap-2 h-full">
        <div className="w-full h-full">
          <span className="font-bold">Nou Motiu Aturada </span>
          <CreateDowntimeReasons assetId={assetId} machineId={machineId} />
        </div>
      </div>
    </div>
  );
}

const CreateDowntimeReasons: React.FC<DowntimesReasonsProps> = ({
  assetId,
  machineId,
}) => {
  const { formValues, isSubmitting, handleChange, handleSubmit } =
    useCreateDowntimeReason({
      machineId: machineId,
      assetId: assetId,
      onSuccess: downtime => setNewDowntimeReason(downtime),
      onError: error => alert(`Error: ${error.message}`),
    });

  const [newDowntimeReason, setNewDowntimeReason] =
    useState<DowntimesReasons | null>(null);

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-row gap-2 my-4 ">
        <div className="flex items-center gap-4">
          <input type="hidden" name="assetId" value={assetId} />
          <input type="hidden" name="machineId" value={machineId} />
          <label
            htmlFor="description"
            className="text-sm font-medium text-gray-700"
          >
            Descripció:
          </label>
          <input
            id="description"
            type="text"
            name="description"
            value={formValues.description}
            onChange={handleChange}
            required
            className="w-64 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-4">
          <label
            htmlFor="downTimeType"
            className="text-sm font-medium text-gray-700"
          >
            Tipus:
          </label>
          <select
            id="downTimeType"
            name="downTimeType"
            onChange={handleChange}
            value={formValues.downTimeType}
            required
            className="w-52 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.values(DowntimesReasonsType)
              .filter(value => typeof value === 'number')
              .map(state => (
                <option key={state} value={state}>
                  {translateDowntimeReasonType(state as DowntimesReasonsType)}
                </option>
              ))}
          </select>
        </div>

        <div className="flex items-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {!isSubmitting && <SvgCreate className="text-white" />}
            {isSubmitting ? 'Creant...' : 'Crear'}
          </button>
        </div>
      </form>
      <div className="w-full py-4 border-t-2 border-gray-200">
        <span className="font-bold py-4 ">Motius Aturada Configurats</span>
        <DownTimeReasonsConfigured
          machineId={machineId}
          asssetId={assetId}
          addDowntimeReason={newDowntimeReason}
        />
      </div>
    </>
  );
};
