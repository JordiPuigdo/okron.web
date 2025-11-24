import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TranslationState {
  translations: Record<string, string>;
  loading: boolean;
  error: string | null;
  currentLang: string;
  fetchTranslations: (lang: string, prefix?: string) => Promise<void>;
  setLang: (lang: string) => void;
}

export const useTranslationStore = create<TranslationState>()(
  persist(
    set => ({
      translations: {},
      loading: false,
      error: null,
      currentLang: process.env.NEXT_PUBLIC_DEFAULT_LANG || 'ca',
      fetchTranslations: async (lang, prefix = '') => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}Config/Translations?lang=${lang}&key=${prefix}`
          );
          const data = await response.json();
          set({ translations: data.translations, loading: false });
        } catch (err) {
          set({ error: 'Failed to load translations', loading: false });
        }
      },
      setLang: lang => set({ currentLang: lang }),
    }),
    {
      name: 'translation-store',
      version: 1.1,
      partialize: state => ({
        translations: state.translations,
        currentLang: state.currentLang,
      }),
    }
  )
);
