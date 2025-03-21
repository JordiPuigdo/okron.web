import { useMemo, useState } from 'react';
import SparePart from 'app/interfaces/SparePart';
import { Button } from 'designSystem/Button/Buttons';

import SearchInputSpareParts from './SearchInputSpareParts';

interface SparePartsListProps {
  spareParts: SparePart[];
  handleAssignSparePart: (sparePart: SparePart) => void;
  assignButton?: boolean;
}
const SparePartsList: React.FC<SparePartsListProps> = ({
  spareParts,
  handleAssignSparePart,
  assignButton = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredSpareParts = useMemo(() => {
    return spareParts.filter(
      sp =>
        sp.code.toLowerCase().includes(normalizedSearch) ||
        sp.description.toLowerCase().includes(normalizedSearch)
    );
  }, [spareParts, normalizedSearch]);

  return (
    <div className="flex flex-col gap-2">
      <SearchInputSpareParts
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Cerca recanvis..."
      />

      <div className="overflow-y-auto border rounded-md p-2">
        {filteredSpareParts.length > 0 ? (
          filteredSpareParts.map(sp => (
            <button
              key={sp.id}
              className="flex items-center justify-between p-2 border-b cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring focus:ring-blue-300 w-full"
              onClick={() => handleAssignSparePart(sp)}
              aria-label={`Assignar ${sp.code} - ${sp.description}`}
            >
              <span className="flex-grow truncate">
                {sp.code} - {sp.description}
              </span>
              {assignButton ? (
                <Button type="create" className="shrink-0">
                  +
                </Button>
              ) : (
                <Button type="delete" className="shrink-0">
                  -
                </Button>
              )}
            </button>
          ))
        ) : (
          <div className="text-center text-gray-500">No hi ha recanvis.</div>
        )}
      </div>
    </div>
  );
};

export default SparePartsList;
