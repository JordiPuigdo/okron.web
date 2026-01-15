'use client';

// ============================================================================
// TYPES
// ============================================================================

interface StatusBadgeProps {
  /** Etiqueta a mostrar */
  label: string;
  /** Clases CSS para el estilo (color de fondo y texto) */
  className: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Badge reutilizable para mostrar estados.
 * Principio SRP: Solo renderiza un badge de estado.
 */
export function StatusBadge({ label, className }: StatusBadgeProps) {
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${className}`}>
      {label}
    </span>
  );
}
