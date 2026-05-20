import { useEffect, useState } from 'react';
import { useSessionStore } from 'app/stores/globalStore';
import { useTranslationStore } from 'app/stores/translationStore';

/**
 * Hook para verificar si los stores de Zustand han completado la hidratación.
 * Útil para evitar hydration mismatches en SSR/CSR.
 *
 * @returns boolean - true cuando todos los stores persistidos están hidratados
 */
export function useStoreHydration(): boolean {
  const sessionHydrated = useSessionStore(state => state._hasHydrated);
  const translationHydrated = useTranslationStore(state => state._hasHydrated);

  return sessionHydrated && translationHydrated;
}

/**
 * Hook para verificar hidratación del session store específicamente.
 * Útil cuando solo necesitas verificar el estado de sesión.
 */
export function useSessionHydration(): boolean {
  return useSessionStore(state => state._hasHydrated);
}

/**
 * Hook para verificar hidratación del translation store específicamente.
 */
export function useTranslationHydration(): boolean {
  return useTranslationStore(state => state._hasHydrated);
}

/**
 * Hook que fuerza un re-render después de la hidratación.
 * Útil para componentes que muestran contenido diferente en servidor vs cliente.
 *
 * @returns boolean - false en servidor/antes de hidratación, true después
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
