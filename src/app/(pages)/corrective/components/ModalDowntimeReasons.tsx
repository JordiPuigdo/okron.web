import { useEffect, useState } from 'react';
import { SvgClose } from 'app/icons/icons';
import {
  DowntimesReasons,
  DowntimesReasonsType,
} from 'app/interfaces/Production/Downtimes';
import DowntimesService from 'app/services/downtimesService';
import { useGlobalStore } from 'app/stores/globalStore';
import { Modal } from 'designSystem/Modals/Modal';

interface ModalDowntimeReasonsProps {
  selectedId: string;
  onSelectedDowntimeReasons: (downtimeReasons: DowntimesReasons) => void;
}

const ModalDowntimeReasons: React.FC<ModalDowntimeReasonsProps> = ({
  selectedId,
  onSelectedDowntimeReasons,
}) => {
  const { setIsModalOpen } = useGlobalStore(state => state);

  const selectedDowntime = (downtimeReasons: DowntimesReasons) => {
    setIsModalOpen(false);
    onSelectedDowntimeReasons(downtimeReasons);
  };

  return (
    <Modal
      isVisible={true}
      type="center"
      height="h-96"
      width="w-full"
      className="max-w-sm mx-auto border border-black"
      avoidClosing={true}
    >
      <div className="relative bg-white">
        <div className="absolute p-2 top-0 right-0 justify-end hover:cursor-pointer">
          <SvgClose
            onClick={() => {
              setIsModalOpen(false);
            }}
          />
        </div>
      </div>
      <DowntimeReasonsModal
        selectedId={selectedId}
        onSelectedDowntimeReasons={selectedDowntime}
      />
    </Modal>
  );
};

export default ModalDowntimeReasons;

interface DowntimeReasonsModalProps {
  selectedId: string;
  onSelectedDowntimeReasons: (downtimeReasons: DowntimesReasons) => void;
}

const DowntimeReasonsModal: React.FC<DowntimeReasonsModalProps> = ({
  selectedId,
  onSelectedDowntimeReasons,
}) => {
  const downtimeService = new DowntimesService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );
  const [downtimeReasons, setDowntimeReasons] = useState<DowntimesReasons[]>(
    []
  );
  const [filteredDowntimeReasons, setFilteredDowntimeReasons] = useState<
    DowntimesReasons[]
  >([]);
  const [selectedFilter, setSelectedFilter] = useState<
    DowntimesReasonsType | undefined
  >(undefined);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  useEffect(() => {
    downtimeService
      .getDowntimesReasonsByMachineId(selectedId, true)
      .then(response => {
        setDowntimeReasons(response);
        setFilteredDowntimeReasons(response);
      });
  }, []);

  function handleFilterTypeChange(value: number) {
    if (value === selectedFilter) {
      setFilteredDowntimeReasons(downtimeReasons);
      setSelectedFilter(undefined);
      return;
    }
    setSelectedFilter(value);
    setFilteredDowntimeReasons(
      downtimeReasons.filter(reason => reason.downTimeType === value)
    );
    setCurrentPage(0);
  }
  const paginatedDowntimeReasons = filteredDowntimeReasons.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const totalPages = Math.ceil(filteredDowntimeReasons.length / itemsPerPage);

  return (
    <div className="p-8 mx-8 flex flex-col gap-4 h-96">
      <div className="flex flex-row justify-center gap-4 mb-4">
        <div
          className={`p-4 w-full max-w-xs text-center font-bold rounded-md cursor-pointer border-2 transition-all
          ${
            selectedFilter === DowntimesReasonsType.Production
              ? 'bg-yellow-500 border-gray-500'
              : 'bg-yellow-200 border-gray-200 hover:bg-yellow-400'
          }`}
          onClick={() =>
            handleFilterTypeChange(DowntimesReasonsType.Production)
          }
        >
          Producció
        </div>
        <div
          className={`p-4 w-full max-w-xs text-center font-bold rounded-md cursor-pointer border-2 transition-all
          ${
            selectedFilter === DowntimesReasonsType.Maintanance
              ? 'bg-blue-500 border-gray-500'
              : 'bg-blue-200 border-gray-200 hover:bg-blue-400'
          }`}
          onClick={() =>
            handleFilterTypeChange(DowntimesReasonsType.Maintanance)
          }
        >
          Manteniment
        </div>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-2 gap-2">
        {paginatedDowntimeReasons.map(reason => (
          <div
            key={reason.id}
            className={`p-3 border-2 ${
              reason.downTimeType === DowntimesReasonsType.Maintanance
                ? 'bg-blue-200 hover:bg-blue-400'
                : 'bg-yellow-200 hover:bg-yellow-400'
            } rounded-lg shadow-sm text-center font-medium cursor-pointer`}
            onClick={() => onSelectedDowntimeReasons(reason)}
          >
            {reason.description}
          </div>
        ))}
      </div>

      {/* Botones de paginación */}
      <div className="flex justify-center items-end mt-auto gap-6">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
          className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          onClick={() =>
            setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))
          }
          disabled={currentPage === totalPages - 1}
          className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded disabled:opacity-50"
        >
          Següent
        </button>
      </div>
    </div>
  );
};
