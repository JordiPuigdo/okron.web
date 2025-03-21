import { useState } from 'react';
import { useSparePartsHook } from 'app/hooks/useSparePartsHook';
import SparePart from 'app/interfaces/SparePart';
import { Button } from 'designSystem/Button/Buttons';

interface SparePartProviderRequestProps {
  handleAssignSparePart: (sparePart: SparePart) => void;
}

const SparePartProviderRequest: React.FC<SparePartProviderRequestProps> = ({
  handleAssignSparePart,
}) => {
  const [selectedSparePart, setSelectedSparePart] = useState<
    SparePart | undefined
  >(undefined);
  const { spareParts } = useSparePartsHook(true);
  const [searchText, setSearchText] = useState('');
  const filteredSpareParts = spareParts?.filter(sp =>
    `${sp.code} - ${sp.description}`
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedId = e.target.value;
    const selected = spareParts?.find(sp => sp.id === selectedId);
    if (selected) {
      setSelectedSparePart(selected);
      setSearchText('');
    }
  }

  return (
    <div className="w-full relative">
      <input
        type="text"
        className="w-full p-2 border rounded-md mb-2"
        placeholder="Afegir recanvi..."
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        onFocus={() => setSearchText('')}
      />

      {searchText && (
        <div className="absolute w-full mt-1 bg-white border rounded-md z-10 shadow-md">
          <select
            className="w-full p-2 border rounded-md"
            onChange={handleChange}
            value={selectedSparePart?.id || ''}
            size={5}
          >
            <option value="">Selecciona un recanvi</option>
            {filteredSpareParts?.map(sp => (
              <option key={sp.id} value={sp.id}>
                {sp.code} - {sp.description}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex flex-row gap-2 border p-4 items-center">
        <div className="w-full">
          {selectedSparePart?.code} - {selectedSparePart?.description}
        </div>
        <div>
          <input placeholder="Quantitat" />
        </div>
        <div>
          <Button type="create" customStyles="gap-2 flex">
            Assignar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SparePartProviderRequest;
