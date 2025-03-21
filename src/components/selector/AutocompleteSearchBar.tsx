import { useEffect, useRef, useState } from 'react';

import ElementListComponent, { ElementList } from './ElementList';
import SearchInput from './SearchInput';

type AutocompleteSearchBarProps = {
  elements: ElementList[];
  setCurrentId: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
  selectedId?: string | null;
  className?: string;
  parentClassName?: string;
};

const AutocompleteSearchBar: React.FC<AutocompleteSearchBarProps> = ({
  elements,
  setCurrentId,
  placeholder,
  disabled = false,
  selectedId,
  className = '',
  parentClassName = 'w-full',
}) => {
  const [query, setQuery] = useState('');
  const [selectedElementIndex, setSelectedElementIndex] = useState<number>(-1);
  const [searchResults, setSearchResults] = useState<ElementList[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  if (selectedId != undefined) {
    setCurrentId(selectedId);
  }

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentId('');
    setQuery(event.target.value);
    setSelectedElementIndex(-1);
    setSearchResults(
      elements.filter(element =>
        element.description
          .toLowerCase()
          .includes(event.target.value.toLowerCase())
      )
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      setSelectedElementIndex(prevIndex =>
        prevIndex === -1 ? searchResults.length - 1 : prevIndex - 1
      );
    } else if (event.key === 'ArrowDown') {
      setSelectedElementIndex(prevIndex =>
        prevIndex === searchResults.length - 1 ? -1 : prevIndex + 1
      );
    } else if (event.key === 'Enter') {
      if (selectedElementIndex !== -1) {
        const selectedElement = searchResults[selectedElementIndex];
        setCurrentId(selectedElement.id);
        setQuery('');
        setSelectedElementIndex(-1);
        setSearchResults([]);
      }
    }
  };

  const handleElementClick = (element: ElementList) => {
    setCurrentId(element.id);
    setQuery('');
    setSelectedElementIndex(-1);
  };

  const scrollActiveElementIntoView = (index: number) => {
    const activeElement = document.getElementById(`element-${index}`);
    if (activeElement) {
      activeElement.scrollIntoView({
        block: 'nearest',
        inline: 'start',
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (selectedElementIndex !== -1) {
      scrollActiveElementIntoView(selectedElementIndex);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setQuery('');
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedElementIndex]);

  return (
    <div ref={dropdownRef} className={`${parentClassName}`}>
      <SearchInput
        value={query}
        onChange={handleQueryChange}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />

      {query !== '' && searchResults.length > 0 && (
        <ElementListComponent
          elements={searchResults}
          selectedElementIndex={selectedElementIndex}
          handleElementClick={handleElementClick}
        />
      )}
    </div>
  );
};

export default AutocompleteSearchBar;
