'use client';

// ============================================================================
// TYPES
// ============================================================================

interface CommentBlockProps {
  /** Título del bloque */
  title: string;
  /** Contenido del comentario */
  content: string;
  /** Variante de estilo */
  variant: 'external' | 'internal';
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Bloque de comentario reutilizable.
 * Principio SRP: Solo renderiza un bloque de comentario.
 */
export function CommentBlock({ title, content, variant }: CommentBlockProps) {
  const styles = {
    external: {
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      title: 'text-blue-700',
    },
    internal: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-400',
      title: 'text-yellow-700',
    },
  };

  const style = styles[variant];

  return (
    <div className={`p-3 ${style.bg} rounded-lg border-l-4 ${style.border}`}>
      <p className={`text-xs font-medium ${style.title} mb-1`}>{title}</p>
      <p className="text-sm text-gray-700">{content}</p>
    </div>
  );
}
