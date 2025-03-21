import React from 'react';

type SearchInputProps = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onKeyDown,
  inputRef,
  placeholder = 'Buscar',
  disabled = false,
  className = '',
}) => {
  return (
    <input
      type="text"
      className={`p-3 text-sm border border-gray-300 rounded-md w-full ${className}`}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      ref={inputRef}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

export default SearchInput;
