import { WorkOrderType } from 'app/interfaces/workOrder';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

interface ChartLegendItem {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

interface ChartLegendProps {
  items: ChartLegendItem[];
}

// Card wrapper para charts
export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  className = '',
}) => {
  return (
    <div
      className={`
        flex flex-col w-full
        bg-white 
        border border-grey-30
        rounded-2xl 
        p-5
        shadow-card
        transition-shadow duration-300
        hover:shadow-lg
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">{title}</h3>
          {subtitle && (
            <p className="text-sm text-grey-70 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Chart content */}
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
};

// Legend component mejorado
export const ChartLegend: React.FC<ChartLegendProps> = ({ items }) => {
  const total = items.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-grey-30">
      {items.map((item, index) => {
        const percentage =
          total > 0 ? Math.round((item.value / total) * 100) : 0;

        return (
          <div
            key={index}
            className="
              flex items-center gap-3 
              px-3 py-2 
              bg-grey-10 
              rounded-lg
              transition-all duration-200
              hover:bg-grey-30
              cursor-default
            "
          >
            {/* Color indicator */}
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />

            {/* Label and value */}
            <div className="flex flex-col">
              <span className="text-xs text-grey-70 font-medium">
                {item.label}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-brand-primary">
                  {item.value}
                </span>
                <span className="text-xs text-grey-70">({percentage}%)</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Colores consistentes para los tipos de work order
export const WORK_ORDER_COLORS = {
  [WorkOrderType.Preventive]: '#3B82F6', // blue-500
  [WorkOrderType.Corrective]: '#EF4444', // red-500
  [WorkOrderType.Ticket]: '#10B981', // green-500
};

// Empty state component
export const ChartEmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 mb-4 rounded-full bg-grey-10 flex items-center justify-center">
      <svg
        className="w-8 h-8 text-grey-50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    </div>
    <p className="text-sm text-grey-70">{message}</p>
  </div>
);

export default ChartCard;
