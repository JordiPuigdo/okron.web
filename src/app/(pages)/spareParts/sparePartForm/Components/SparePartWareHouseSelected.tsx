import { useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { useWareHouses } from 'app/hooks/useWareHouses';

interface SparePartWareHouseSelectedProps {
  handleAssignWareHouse(wareHouseId: string): void;
}

const SparePartWareHouseSelected: React.FC<SparePartWareHouseSelectedProps> = ({
  handleAssignWareHouse,
}) => {
  const { t } = useTranslations();
  const { warehouses } = useWareHouses(true);
  const [searchText, setSearchText] = useState('');
  const [selectedWareHouseId, setSelectedWareHouseId] = useState<string | null>(
    null
  );
  const filteredSpareParts = warehouses?.filter(sp =>
    `${sp.code} - ${sp.description}`
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedId = e.target.value;
    const selected = warehouses?.find(sp => sp.id === selectedId);
    if (selected) {
      setSearchText('');
      setSelectedWareHouseId(selected.id);
      handleAssignWareHouse(selected.id);
    }
  }

  return (
    <div className="w-full relative">
      <input
        type="text"
        className="w-full p-2 border rounded-md mb-2"
        placeholder={t('search.warehouses')}
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        onFocus={() => setSearchText('')}
      />

      {searchText && (
        <div className="absolute w-full mt-1 bg-white border rounded-md z-10 shadow-md">
          <select
            className="w-full p-2 border rounded-md"
            onChange={handleChange}
            value={selectedWareHouseId || ''}
            size={5}
          >
            <option value="">{t('select.warehouse')}</option>
            {filteredSpareParts?.map(sp => (
              <option key={sp.id} value={sp.id}>
                {sp.code} - {sp.description}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default SparePartWareHouseSelected;
