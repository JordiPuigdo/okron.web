'use client';

// ============================================================================
// TYPES
// ============================================================================

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  variant: 'primary' | 'secondary';
}

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
  const variantClasses =
    variant === 'primary'
      ? 'bg-[#6E41B6] text-white hover:bg-[#5a3596]'
      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
