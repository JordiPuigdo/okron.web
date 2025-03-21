interface TableTotalRowComponentProps {
  totalCounts: boolean;
  totalQuantity: number;
  columnsLength: number;
}

export const TableTotalRowComponent: React.FC<TableTotalRowComponentProps> = ({
  totalCounts,
  totalQuantity,
  columnsLength,
}) => {
  if (!totalCounts) return null;
  return (
    <tr className="bg-gray-100 border-t-2 border-gray-900">
      <td className="px-6 py-4 whitespace-nowrap font-semibold text-left">
        Total Unitats Consumides
      </td>
      <td
        colSpan={columnsLength - 2}
        className="px-6 pr-8 text-lg text-gray-900 font-semibold text-right"
      >
        {totalQuantity}
      </td>
      <td className="px-6 pr-8 text-lg text-gray-900 font-semibold text-right"></td>
    </tr>
  );
};
