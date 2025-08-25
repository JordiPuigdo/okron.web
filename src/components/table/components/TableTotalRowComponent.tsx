interface TableTotalRowComponentProps {
  placeholder?: string;
  totalCounts: boolean;
  totalQuantity: number | string;
  columnsLength: number;
}

export const TableTotalRowComponent: React.FC<TableTotalRowComponentProps> = ({
  placeholder,
  totalCounts,
  totalQuantity,
  columnsLength,
}) => {
  if (!totalCounts) return null;
  return (
    <tr className="bg-gray-100 border-t-2 border-gray-300">
      <td className="px-6 py-4 whitespace-nowrap font-semibold text-md text-left">
        {placeholder || 'Total'}
      </td>
      <td
        colSpan={columnsLength - 2}
        className="text-lg text-gray-900 font-semibold text-right pr-6"
      >
        {totalQuantity}
      </td>
      <td className="px-6 pr-8 text-lg text-gray-900 font-semibold text-right"></td>
    </tr>
  );
};
