'use client';

import { useEffect, useState } from 'react';
import { SvgDelete } from 'app/icons/icons';
import {
  DowntimesReasons,
  DowntimesReasonsType,
} from 'app/interfaces/Production/Downtimes';
import DowntimesService from 'app/services/downtimesService';
import { translateDowntimeReasonType } from 'app/utils/utils';

import { EditableCell } from './EditingCell';

interface DownTimeReasonsConfiguredProps {
  machineId?: string;
  asssetId?: string;
  addDowntimeReason: DowntimesReasons | null;
}

const DownTimeReasonsConfigured: React.FC<DownTimeReasonsConfiguredProps> = ({
  machineId = '',
  asssetId = '',
  addDowntimeReason,
}) => {
  const [downtimeReasons, setDowntimeReasons] = useState<DowntimesReasons[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const [filteredReasonType, setFilteredReasonType] = useState<
    DowntimesReasonsType | undefined
  >(undefined);

  const downtimeReasonsService = new DowntimesService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );
  useEffect(() => {
    const fetchDowntimeReasons = async () => {
      try {
        const data =
          await downtimeReasonsService.getDowntimesReasonsByMachineId(
            machineId != '' ? machineId : asssetId
          );
        if (data) setDowntimeReasons(data);
      } catch (err) {
        setError('Failed to fetch downtime reasons');
      } finally {
        setLoading(false);
      }
    };

    fetchDowntimeReasons();
  }, [machineId]);

  useEffect(() => {
    if (addDowntimeReason) {
      setDowntimeReasons(prev => [...prev, addDowntimeReason]);
    }
  }, [addDowntimeReason]);

  const handleUpdate = async (id: string, updatedDescription: string) => {
    const reason = downtimeReasons.find(x => x.id == id);
    downtimeReasonsService.updateDowntimesReason({
      description: updatedDescription,
      id: id,
      downTimeType: reason!.downTimeType,
      machineId: machineId,
    });
    setDowntimeReasons(prev =>
      prev.map(reason =>
        reason.id === id
          ? { ...reason, description: updatedDescription }
          : reason
      )
    );
  };

  const handleDelete = async (id: string) => {
    downtimeReasonsService.deleteDowntimesReason(id);
    setDowntimeReasons(prev => prev.filter(reason => reason.id !== id));
  };

  const filteredReasons = downtimeReasons.filter(reason => {
    const matchesType =
      filteredReasonType !== undefined && filteredReasonType.toString() !== '-1'
        ? reason.downTimeType === filteredReasonType
        : true;

    const matchesSearchTerm =
      searchTerm.trim() === '' ||
      reason.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesSearchTerm;
  });

  const totalPages = Math.ceil(filteredReasons.length / itemsPerPage);
  const displayedReasons = filteredReasons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = parseInt(event.target.value, 10);
    setFilteredReasonType(selectedValue);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="">
      <div className="flex justify-between gap-2 py-4">
        <input
          type="text"
          placeholder="Buscar per descripció..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-64 p-2 border border-gray-300 rounded-md "
        />
        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          onChange={handleFilterChange}
        >
          <option value="-1">Sense Filtre</option>
          {Object.values(DowntimesReasonsType)
            .filter(value => typeof value === 'number')
            .map(state => (
              <option key={state} value={state}>
                {translateDowntimeReasonType(state as DowntimesReasonsType)}
              </option>
            ))}
        </select>
      </div>
      <div className="overflow-y-auto max-h-96 border border-gray-200 rounded-lg">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Descripció
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Tipus
              </th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider text-end">
                Eliminar
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayedReasons.map((reason, index) => (
              <tr
                key={reason.id}
                className={`hover:bg-gray-50 ${
                  index % 2 === 1 ? 'bg-gray-200' : ''
                }`}
              >
                <td className="px-6 py-2 text-sm font-medium text-gray-900">
                  <EditableCell
                    value={reason.description}
                    onUpdate={newDescription =>
                      handleUpdate(reason.id, newDescription)
                    }
                  />
                </td>
                <td className="px-6 py-2 text-sm text-gray-900 text-start">
                  {translateDowntimeReasonType(reason.downTimeType)}
                </td>
                <td className="px-6 py-2 text-sm font-medium text-gray-900 text-end">
                  <button
                    onClick={() => handleDelete(reason.id)}
                    className="inline-flex items-center p-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <SvgDelete className="text-white w-6 h-6" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 bg-gray-300 rounded disabled:bg-gray-100"
        >
          Anterior
        </button>
        <span>
          Pàgina {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 bg-gray-300 rounded disabled:bg-gray-100"
        >
          Següent
        </button>
      </div>
    </div>
  );
};

export default DownTimeReasonsConfigured;
