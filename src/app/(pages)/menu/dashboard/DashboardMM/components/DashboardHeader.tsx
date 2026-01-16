import { DateFilter, DateFilters } from 'components/Filters/DateFilter';

interface KPIData {
  label: string;
  value: string | number;
  icon: JSX.Element;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface DashboardHeaderProps {
  dateFilters: DateFilters;
  setDateFilters: (filters: DateFilters) => void;
  onSearch: () => void;
  totalMinutes: number;
  totalCosts: number;
  searchLabel: string;
  minutesLabel: string;
  costLabel: string;
}

// Iconos SVG inline para los KPIs
const ClockIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CurrencyIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.25 7.756a4.5 4.5 0 100 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className="w-5 h-5 text-grey-70"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
    />
  </svg>
);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(value);
};

const formatNumber = (value: number) => {
  return Math.round(value).toLocaleString('es-ES');
};

// Componente KPI Card individual
const KPICard = ({ label, value, icon }: KPIData) => (
  <div
    className="
      group flex items-center gap-3 
      bg-grey-10 hover:bg-white
      border border-transparent hover:border-grey-50
      rounded-xl px-4 py-3
      transition-all duration-200
      hover:shadow-card
    "
  >
    <div
      className="
        flex items-center justify-center 
        w-10 h-10 rounded-lg 
        bg-white group-hover:bg-brand-purple/5
        text-brand-purple
        shadow-sm
        transition-all duration-200
      "
    >
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-xs font-medium text-grey-70 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-lg font-bold text-brand-primary">{value}</span>
    </div>
  </div>
);

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  dateFilters,
  setDateFilters,
  onSearch,
  totalMinutes,
  totalCosts,
  searchLabel,
  minutesLabel,
  costLabel,
}) => {
  return (
    <div className="w-full animate-fadeIn">
      {/* Container principal */}
      <div
        className="
          flex flex-col xl:flex-row 
          items-stretch xl:items-center 
          gap-4 
          bg-white 
          border border-grey-30 
          rounded-2xl 
          p-4 lg:p-5
          shadow-card
        "
      >
        {/* Sección de filtros de fecha */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
          {/* Icono de calendario */}
          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-grey-10">
            <CalendarIcon />
          </div>

          {/* Date pickers */}
          <div className="flex-1">
            <DateFilter
              dateFilters={dateFilters}
              setDateFilters={setDateFilters}
              startTimeClassName="text-grey-70 font-medium text-sm"
              endTimeClassName="text-grey-70 font-medium text-sm"
              className="gap-3"
            />
          </div>

          {/* Botón de búsqueda */}
          <button
            onClick={onSearch}
            className="
              group flex items-center gap-2
              bg-brand-purple hover:bg-brand-accent
              text-white font-medium
              px-5 py-2.5 rounded-xl
              transition-all duration-200
              hover:shadow-lg hover:shadow-brand-purple/25
              active:scale-[0.98]
            "
          >
            <SearchIcon />
            <span className="text-white">{searchLabel}</span>
          </button>
        </div>

        {/* Separador vertical */}
        <div className="hidden xl:block w-px h-12 bg-grey-30" />

        {/* Sección de KPIs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <KPICard
            label={minutesLabel}
            value={formatNumber(totalMinutes)}
            icon={<ClockIcon />}
          />
          <KPICard
            label={costLabel}
            value={`${formatCurrency(totalCosts)} €`}
            icon={<CurrencyIcon />}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
