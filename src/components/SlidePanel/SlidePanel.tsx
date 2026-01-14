'use client';

import { useCallback, useEffect } from 'react';
import { X } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface SlidePanelProps {
  /** Controla si el panel está abierto */
  isOpen: boolean;
  /** Callback cuando se cierra el panel */
  onClose: () => void;
  /** Contenido del panel */
  children: React.ReactNode;
  /** Título opcional del header */
  title?: string;
  /** Subtítulo opcional */
  subtitle?: string;
  /** Ancho del panel (default: 'md') */
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Si muestra el overlay oscuro (default: true) */
  showOverlay?: boolean;
  /** Si se cierra al hacer clic en el overlay (default: true) */
  closeOnOverlayClick?: boolean;
  /** Si muestra el header por defecto (default: true) */
  showHeader?: boolean;
  /** Acciones adicionales para el header */
  headerActions?: React.ReactNode;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const WIDTH_CLASSES: Record<NonNullable<SlidePanelProps['width']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-2xl',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * SlidePanel - Panel deslizante reutilizable.
 *
 * Principios SOLID:
 * - SRP: Solo maneja la animación y estructura del panel
 * - OCP: Extensible via children y headerActions
 * - DIP: No depende de implementaciones concretas de contenido
 *
 * @example
 * ```tsx
 * <SlidePanel isOpen={isOpen} onClose={onClose} title="Vista previa">
 *   <BudgetPreviewContent data={budget} />
 * </SlidePanel>
 * ```
 */
export function SlidePanel({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  width = 'full',
  showOverlay = true,
  closeOnOverlayClick = true,
  showHeader = true,
  headerActions,
}: SlidePanelProps) {
  // Handle ESC key to close
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      {showOverlay && (
        <div
          className={`
            fixed inset-0 bg-black/30 backdrop-blur-sm z-40
            transition-opacity duration-300 ease-in-out
            ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        className={`
          fixed top-0 right-0 h-full z-50
          bg-white shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          w-full ${WIDTH_CLASSES[width]}
          flex flex-col
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'slide-panel-title' : undefined}
      >
        {/* Header */}
        {showHeader && (
          <SlidePanelHeader
            title={title}
            subtitle={subtitle}
            onClose={onClose}
            actions={headerActions}
          />
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface SlidePanelHeaderProps {
  title?: string;
  subtitle?: string;
  onClose: () => void;
  actions?: React.ReactNode;
}

function SlidePanelHeader({
  title,
  subtitle,
  onClose,
  actions,
}: SlidePanelHeaderProps) {
  return (
    <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {title && (
            <h2
              id="slide-panel-title"
              className="text-xl font-bold text-gray-900 truncate"
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 truncate">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Tancar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

interface SlidePanelSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Sección dentro del SlidePanel con título opcional.
 */
export function SlidePanelSection({
  title,
  children,
  className = '',
}: SlidePanelSectionProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {title && (
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

interface SlidePanelActionsProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Barra de acciones fija en la parte inferior del panel.
 */
export function SlidePanelActions({
  children,
  className = '',
}: SlidePanelActionsProps) {
  return (
    <div
      className={`flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 ${className}`}
    >
      <div className="flex items-center gap-2 flex-wrap">{children}</div>
    </div>
  );
}

// Export default for convenience
export default SlidePanel;
