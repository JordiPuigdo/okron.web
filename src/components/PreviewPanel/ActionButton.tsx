'use client';

// ============================================================================
// TYPES
// ============================================================================

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  variant: 'primary' | 'secondary' | 'success' | 'warning';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const VARIANT_CLASSES: Record<ActionButtonProps['variant'], string> = {
  primary: 'bg-[#6E41B6] text-white hover:bg-[#5a3596]',
  secondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
  success: 'bg-green-600 text-white hover:bg-green-700',
  warning: 'bg-amber-500 text-white hover:bg-amber-600',
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Botón de acción reutilizable para los paneles.
 * Principio SRP: Solo renderiza un botón con estilos predefinidos.
 */
export function ActionButton({
  onClick,
  icon: Icon,
  label,
  variant,
}: ActionButtonProps) {
  const baseClasses =
    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${VARIANT_CLASSES[variant]}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
