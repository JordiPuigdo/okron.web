import { useState } from "react";
import { Preventive } from "app/interfaces/Preventive";

interface PreventiveOperatorTableProps {
  title: string;
  preventives?: Preventive[] | null;
  assignedPreventiveIds: Set<string> | null;
  selected: Set<string>;
  onSelectAll: (selectAll: boolean) => void;
  onSelect: (id: string) => void;
  onActionClick: (id?: string) => Promise<void>; // Change to Promise<void>
  actionLabel: string;
  enableFilterPending?: boolean;
}

const PreventiveOperatorTable: React.FC<PreventiveOperatorTableProps> = ({
  title,
  preventives,
  assignedPreventiveIds,
  selected,
  onSelectAll,
  onSelect,
  onActionClick,
  actionLabel,
  enableFilterPending,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showPending, setShowPending] = useState(false);
  const [showAssigned, setShowAssigned] = useState(false);
  // Filter preventives based on the search query
  const filteredPreventives = preventives?.filter(
    (preventive) =>
      preventive.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preventive.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter for pending preventives
  const displayedPreventives = showPending
    ? filteredPreventives?.filter(
        (preventive) => !assignedPreventiveIds?.has(preventive.id)
      )
    : showAssigned
    ? filteredPreventives?.filter((x) => assignedPreventiveIds?.has(x.id))
    : filteredPreventives;

  // Toggle function for filtering pending preventives
  const togglePendingFilter = () => {
    setShowPending((prev) => !prev);
  };

  const toggleAssignedFilter = () => {
    setShowAssigned((prev) => !prev);
  };

  return (
    <div className="flex flex-col bg-white gap-4 w-full items-center p-2 rounded-xl">
      <div className="flex flex-col w-full mb-4">
        <span className="flex text-lg font-semibold bg-gray-800 p-2 m-2 rounded-xl items-center text-white">
          {title}
        </span>
        {enableFilterPending ? (
          <div>
            <button
              className={`${
                showPending ? "bg-gray-500" : "bg-blue-500"
              } text-white p-2 rounded-xl m-2`}
              type="button"
              onClick={togglePendingFilter}
            >
              {showPending ? "Tots el preventius" : "Pendents d'assignar"}
            </button>
            <button
              type="button"
              className={`${
                showAssigned ? "bg-gray-500" : "bg-blue-500"
              } text-white p-2 rounded-xl m-2`}
              onClick={toggleAssignedFilter}
            >
              {showAssigned ? "Tots els preventius" : "Assignats al operari"}
            </button>
          </div>
        ) : (
          <span className="mt-14"></span>
        )}

        <input
          type="text"
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border border-gray-300 rounded m-2"
        />
      </div>
      <div className="flex-grow w-full max-h-96 overflow-y-auto">
        <table className="table-auto w-full border-collapse">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr className="text-left">
              <th className="p-2">
                <input
                  type="checkbox"
                  onChange={(e) => onSelectAll(e.target.checked)}
                  checked={
                    displayedPreventives?.length === selected.size &&
                    displayedPreventives.length > 0
                  }
                />
              </th>
              <th className="p-2">Codi</th>
              <th className="p-2">Descripció</th>
              <th className="p-2 text-end">Acció</th>
            </tr>
          </thead>
          <tbody>
            {displayedPreventives?.map((x) => (
              <tr
                key={x.id}
                className={`border-b ${
                  selected.has(x.id) ? "bg-green-200" : ""
                } ${assignedPreventiveIds?.has(x.id) ? "bg-red-200" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(x.id);
                }}
              >
                <td className="p-2">
                  {!assignedPreventiveIds?.has(x.id) && (
                    <input type="checkbox" checked={selected.has(x.id)} />
                  )}
                </td>
                <td className="p-2">{x.code}</td>
                <td className="p-2">{x.description}</td>
                <td className="p-2 flex justify-end">
                  {!assignedPreventiveIds?.has(x.id) && (
                    <button
                      className="bg-green-500 text-white p-2 rounded-xl m-2"
                      onClick={() => onActionClick(x.id)}
                    >
                      {actionLabel}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-row w-full justify-between p-2 items-end border-t-2 border-gray-500">
        <span>Total: {displayedPreventives?.length}</span>
        <div className="flex justify-end p-2">
          <button
            onClick={() => onActionClick()}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreventiveOperatorTable;
