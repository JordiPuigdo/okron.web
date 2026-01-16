'use client';

import { ReactNode } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface ContentCardProps {
  children: ReactNode;
  className?: string;
  /** Variant del card: default (blanc), highlighted (color de marca) */
  variant?: 'default' | 'highlighted' | 'transparent';
  /** Si té ombra */
  shadow?: boolean;
  /** Padding del card */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface ContentCardHeaderProps {
  children: ReactNode;
  className?: string;
  /** Accions al costat dret del header */
  actions?: ReactNode;
}

interface ContentCardBodyProps {
  children: ReactNode;
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const VARIANT_CLASSES = {
  default: 'bg-white',
  highlighted: 'bg-gradient-to-br from-okron-primary to-okron-secondary',
  transparent: 'bg-transparent',
};

const PADDING_CLASSES = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * ContentCard - Card contenidor principal.
 *
 * Estil inspirat en Instagram: cantonades arrodonides, ombra suau.
 * Suporta diferents variants per destacar contingut important.
 */
export function ContentCard({
  children,
  className = '',
  variant = 'default',
  shadow = true,
  padding = 'md',
}: ContentCardProps) {
  const baseClasses = 'rounded-xl transition-all duration-200';
  const shadowClass = shadow ? 'shadow-sm hover:shadow-md' : '';
  const variantClass = VARIANT_CLASSES[variant];
  const paddingClass = PADDING_CLASSES[padding];

  return (
    <div
      className={`
        ${baseClasses}
        ${shadowClass}
        ${variantClass}
        ${paddingClass}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * ContentCardHeader - Header del card amb títol i accions.
 */
export function ContentCardHeader({
  children,
  className = '',
  actions,
}: ContentCardHeaderProps) {
  return (
    <div
      className={`
        flex items-center justify-between gap-4 mb-4
        ${className}
      `}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/**
 * ContentCardBody - Cos del card.
 */
export function ContentCardBody({
  children,
  className = '',
}: ContentCardBodyProps) {
  return <div className={className}>{children}</div>;
}
