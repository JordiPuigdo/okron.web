import { StateWorkOrder } from 'app/interfaces/workOrder';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

interface StatusCardProps {
  state: StateWorkOrder;
  value: number;
  label: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

// Configuración de estilos por estado usando la paleta oficial de Okron
const statusConfig: Record<
  StateWorkOrder,
  {
    bgColor: string;
    iconBg: string;
    textColor: string;
    borderColor: string;
    icon: JSX.Element;
  }
> = {
  [StateWorkOrder.Waiting]: {
    bgColor: 'bg-white',
    iconBg: 'bg-brand-yellow-10',
    textColor: 'text-brand-yellow',
    borderColor: 'border-brand-yellow/30',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  [StateWorkOrder.OnGoing]: {
    bgColor: 'bg-white',
    iconBg: 'bg-extra-turquoise/10',
    textColor: 'text-extra-turquoise',
    borderColor: 'border-extra-turquoise/30',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  [StateWorkOrder.Paused]: {
    bgColor: 'bg-white',
    iconBg: 'bg-grey-30',
    textColor: 'text-grey-70',
    borderColor: 'border-grey-50',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  [StateWorkOrder.PendingToValidate]: {
    bgColor: 'bg-white',
    iconBg: 'bg-brand-purple/10',
    textColor: 'text-brand-purple',
    borderColor: 'border-brand-purple/30',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  [StateWorkOrder.Finished]: {
    bgColor: 'bg-white',
    iconBg: 'bg-alert-success/10',
    textColor: 'text-alert-success',
    borderColor: 'border-alert-success/30',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  [StateWorkOrder.Requested]: {
    bgColor: 'bg-white',
    iconBg: 'bg-alert-warningLight',
    textColor: 'text-alert-warning',
    borderColor: 'border-alert-warning/30',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
  },
  [StateWorkOrder.Open]: {
    bgColor: 'bg-white',
    iconBg: 'bg-alert-success/10',
    textColor: 'text-alert-success',
    borderColor: 'border-alert-success/30',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  [StateWorkOrder.Closed]: {
    bgColor: 'bg-white',
    iconBg: 'bg-grey-30',
    textColor: 'text-grey-70',
    borderColor: 'border-grey-50',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
  },
  [StateWorkOrder.NotFinished]: {
    bgColor: 'bg-white',
    iconBg: 'bg-alert-warningLight',
    textColor: 'text-alert-warning',
    borderColor: 'border-alert-warning/30',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  [StateWorkOrder.Invoiced]: {
    bgColor: 'bg-white',
    iconBg: 'bg-brand-accent/10',
    textColor: 'text-brand-accent',
    borderColor: 'border-brand-accent/30',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
        />
      </svg>
    ),
  },
};

export const StatusCard: React.FC<StatusCardProps> = ({
  state,
  value,
  label,
  startDate,
  endDate,
}) => {
  const config = statusConfig[state];
  const router = useRouter();

  const handleClick = () => {
    const params = new URLSearchParams({
      workOrderType: 'undefined',
      workOrderState: state.toString(),
      startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : '',
      endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : '',
      isInvoiced: 'false',
      hasDeliveryNote: 'false',
      useOperatorLogged: 'false',
    });

    router.push(`/workOrders?${params.toString()}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        group relative flex flex-col justify-between
        ${config.bgColor} 
        border ${config.borderColor}
        rounded-xl p-4 min-w-[140px] w-full
        shadow-card hover:shadow-lg
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:scale-[1.02]
        cursor-pointer
      `}
    >
      {/* Indicador de color superior */}
      <div
        className={`
          absolute top-0 left-1/2 -translate-x-1/2 
          w-12 h-1 rounded-b-full
          ${config.textColor.replace('text-', 'bg-')}
          opacity-60 group-hover:opacity-100 group-hover:w-16
          transition-all duration-300
        `}
      />

      {/* Header con icono */}
      <div className="flex items-center justify-between mb-3 mt-1">
        <div
          className={`
            flex items-center justify-center 
            w-10 h-10 rounded-lg
            ${config.iconBg} ${config.textColor}
            transition-transform duration-300
            group-hover:scale-110 group-hover:rotate-3
          `}
        >
          {config.icon}
        </div>
      </div>

      {/* Valor principal */}
      <div className="flex flex-col gap-1">
        <span
          className={`
            text-3xl font-bold ${config.textColor}
            transition-all duration-300
            group-hover:scale-105 origin-left
          `}
        >
          {value}
        </span>
        <span className="text-sm font-medium text-grey-70 truncate">
          {label}
        </span>
      </div>

      {/* Efecto de brillo en hover */}
      <div
        className="
          absolute inset-0 rounded-xl
          bg-gradient-to-r from-transparent via-white/20 to-transparent
          opacity-0 group-hover:opacity-100
          -translate-x-full group-hover:translate-x-full
          transition-all duration-700 ease-out
          pointer-events-none
        "
      />
    </div>
  );
};

export default StatusCard;
