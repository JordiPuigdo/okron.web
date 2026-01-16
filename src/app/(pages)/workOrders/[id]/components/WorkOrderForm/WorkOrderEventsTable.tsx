'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { WorkOrderEvents } from 'app/interfaces/workOrder';
import {
  differenceBetweenDates,
  formatDate,
  translateWorkOrderEventType,
} from 'app/utils/utils';
import { ArrowUpDown, Calendar, Clock, Timer, User } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface WorkOrderEventsTableProps {
  events: WorkOrderEvents[];
  className?: string;
}

type SortOrder = 'asc' | 'desc';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * WorkOrderEventsTable - Taula d'historial d'events de l'ordre de treball.
 *
 * Mostra l'historial d'accions (iniciat, pausat, finalitzat, etc.)
 * amb informació de l'operador i durada.
 *
 * Característiques:
 * - Ordenació per data (ascendent/descendent)
 * - Estil modern amb icones
 * - Càlcul automàtic de durades
 */
export function WorkOrderEventsTable({
  events,
  className = '',
}: WorkOrderEventsTableProps) {
  const { t } = useTranslations();
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Ordenar events
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [events, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>{t('no.events') || 'No hi ha events registrats'}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 border-b border-gray-200">
        <HeaderCell
          icon={<Calendar className="w-4 h-4" />}
          label={t('action.date')}
          sortable
          sortOrder={sortOrder}
          onSort={toggleSortOrder}
        />
        <HeaderCell label={t('action')} />
        <HeaderCell icon={<User className="w-4 h-4" />} label={t('operator')} />
        <HeaderCell
          icon={<Calendar className="w-4 h-4" />}
          label={t('final')}
        />
        <HeaderCell icon={<Timer className="w-4 h-4" />} label={t('total')} />
      </div>

      {/* Body */}
      <div className="divide-y divide-gray-100">
        {sortedEvents.map((event, index) => (
          <EventRow key={event.id || index} event={event} t={t} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface HeaderCellProps {
  label: string;
  icon?: React.ReactNode;
  sortable?: boolean;
  sortOrder?: SortOrder;
  onSort?: () => void;
}

function HeaderCell({
  label,
  icon,
  sortable,
  sortOrder,
  onSort,
}: HeaderCellProps) {
  const content = (
    <div className="flex items-center gap-2 text-gray-600 font-semibold text-sm">
      {icon}
      <span>{label}</span>
      {sortable && (
        <ArrowUpDown
          className={`w-4 h-4 transition-transform ${
            sortOrder === 'desc' ? 'rotate-180' : ''
          }`}
        />
      )}
    </div>
  );

  if (sortable) {
    return (
      <button
        type="button"
        onClick={onSort}
        className="flex items-center hover:text-gray-900 transition-colors"
      >
        {content}
      </button>
    );
  }

  return <div>{content}</div>;
}

interface EventRowProps {
  event: WorkOrderEvents;
  t: (key: string) => string;
}

function EventRow({ event, t }: EventRowProps) {
  const duration =
    event.endDate != null
      ? differenceBetweenDates(new Date(event.date), new Date(event.endDate))
          .fullTime
      : null;

  return (
    <div className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50 transition-colors">
      {/* Data inici */}
      <div className="text-gray-700 text-sm">{formatDate(event.date)}</div>

      {/* Tipus d'event */}
      <div className="text-sm font-medium">
        <EventTypeBadge type={event.workOrderEventType} t={t} />
      </div>

      {/* Operador */}
      <div className="text-gray-700 text-sm truncate">
        {event.operator?.name || '-'}
      </div>

      {/* Data fi */}
      <div className="text-gray-500 text-sm">
        {event.endDate ? formatDate(event.endDate) : '-'}
      </div>

      {/* Durada */}
      <div className="text-gray-700 text-sm font-medium">{duration || '-'}</div>
    </div>
  );
}

interface EventTypeBadgeProps {
  type: number;
  t: (key: string) => string;
}

function EventTypeBadge({ type, t }: EventTypeBadgeProps) {
  const label = translateWorkOrderEventType(type, t);

  // Colors segons tipus d'event
  const colorClasses = getEventTypeColor(type);

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${colorClasses}
      `}
    >
      {label}
    </span>
  );
}

// Helper per obtenir colors segons tipus d'event
function getEventTypeColor(type: number): string {
  // WorkOrderEventType enum values
  const colors: Record<number, string> = {
    0: 'bg-green-100 text-green-800', // Started
    1: 'bg-yellow-100 text-yellow-800', // Paused
    2: 'bg-blue-100 text-blue-800', // Resumed
    3: 'bg-purple-100 text-purple-800', // Finished
    4: 'bg-gray-100 text-gray-800', // Comment
    5: 'bg-red-100 text-red-800', // Error
  };

  return colors[type] || 'bg-gray-100 text-gray-800';
}
