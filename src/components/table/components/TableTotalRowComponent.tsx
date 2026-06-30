import { cn } from 'lib/utils';

import { Column } from '../interface/interfaceTable';
import { formatColumnTotal } from '../utils/TableUtils';

interface TableTotalRowComponentProps {
  totalCounts: boolean;
  columns: Column[];
  totals: Record<string, number>;
  enableCheckbox: boolean;
  label: string;
}

export const TableTotalRowComponent: React.FC<TableTotalRowComponentProps> = ({
  totalCounts,
  columns,
  totals,
  enableCheckbox,
  label,
}) => {
  if (!totalCounts) return null;
  if (!columns.some(column => column.summable)) return null;

  const visibleColumns = columns.filter(
    column =>
      column.key.toUpperCase() !== 'ID' && column.label.toUpperCase() !== 'ID'
  );

  return (
    <tr className="bg-gray-100 border-t-2 border-gray-300 font-semibold">
      {enableCheckbox && <td className="p-4" />}
      {visibleColumns.map((column, index) => {
        if (column.summable) {
          return (
            <td
              key={column.key}
              className="p-4 pr-8 text-lg text-gray-900 text-right whitespace-nowrap"
            >
              {formatColumnTotal(totals[column.key] ?? 0, column.format)}
            </td>
          );
        }

        return (
          <td
            key={column.key}
            className={cn(
              'p-4',
              index === 0 &&
                'px-6 whitespace-nowrap text-md text-left text-gray-900'
            )}
          >
            {index === 0 ? label : ''}
          </td>
        );
      })}
      <td className="p-4" />
    </tr>
  );
};
