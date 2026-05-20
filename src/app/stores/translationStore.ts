import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface TranslationState {
  translations: Record<string, string>;
  loading: boolean;
  error: string | null;
  currentLang: string;
  _hasHydrated: boolean;
  fetchTranslations: (lang: string, prefix?: string) => Promise<boolean>;
  setLang: (lang: string) => void;
  setHasHydrated: (state: boolean) => void;
}

const STORE_VERSION = parseInt(process.env.NEXT_PUBLIC_BUILD_VERSION || '1', 10);

const getInitialTranslationState = () => ({
  translations: {},
  loading: false,
  error: null,
  currentLang: process.env.NEXT_PUBLIC_DEFAULT_LANG || 'ca',
  _hasHydrated: false,
});

export const useTranslationStore = create<TranslationState>()(
  persist(
    set => ({
      ...getInitialTranslationState(),
      fetchTranslations: async (lang, prefix = '') => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}Config/Translations?lang=${lang}&key=${prefix}`
          );
          const data = await response.json();
          set({ translations: data.translations, loading: false });
          return Object.keys(data.translations).length > 0;
        } catch (err) {
          set({ error: 'Failed to load translations', loading: false });
          return false;
        }
      },
      setLang: lang => set({ currentLang: lang }),
      setHasHydrated: state => set({ _hasHydrated: state }),
    }),
    {
      name: 'translation-store',
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        translations: state.translations,
        currentLang: state.currentLang,
      }),
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
      migrate: (persistedState, version) => {
        // Si la versión cambia, devolver estado inicial limpio
        // No extender el estado antiguo para evitar propiedades obsoletas
        if (version !== STORE_VERSION) {
          return getInitialTranslationState() as TranslationState;
        }
        // Si es la misma versión, validar la estructura básica
        const state = persistedState as Partial<TranslationState>;
        if (!state || typeof state.translations !== 'object') {
          return getInitialTranslationState() as TranslationState;
        }
        return {
          ...getInitialTranslationState(),
          translations: state.translations || {},
          currentLang: state.currentLang || process.env.NEXT_PUBLIC_DEFAULT_LANG || 'ca',
        } as TranslationState;
      },
    }
  )
);
