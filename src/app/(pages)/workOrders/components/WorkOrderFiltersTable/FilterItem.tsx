export function FilterItem<T>({
  name,
  value,
  selectedFilters,
  onToggle,
}: {
  name: string;
  value: T;
  selectedFilters: T[];
  onToggle: (value: T) => void;
}) {
  const isSelected = selectedFilters.includes(value);

  return (
    <li
      className={`flex w-full justify-between py-3 cursor-pointer font-semibold text-sm group 
      ${!isSelected ? 'hover:bg-gray-300' : 'bg-green-200'}`}
      onClick={() => onToggle(value)}
    >
      <div className="flex items-center">
        <span
          className={`flex pm-2 p-2 m-2 ${
            isSelected ? 'bg-green-600' : 'bg-slate-600'
          }`}
        />
        <span>{name}</span>
      </div>
    </li>
  );
}
