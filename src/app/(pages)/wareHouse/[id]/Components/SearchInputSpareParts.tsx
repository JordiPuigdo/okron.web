import { useEffect, useState } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchInputSpareParts: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
}) => {
  const [searchTerm, setSearchTerm] = useState(value);

  useEffect(() => {
    onChange(searchTerm);
  }, [searchTerm, onChange]);

  return (
    <input
      type="text"
      placeholder={placeholder}
      className="border rounded p-2 my-2 w-full"
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
    />
  );
};

export default SearchInputSpareParts;
