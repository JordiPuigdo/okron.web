import { useTranslationStore } from 'app/stores/translationStore';

export const useTranslations = () => {
  const { translations, loading, error, fetchTranslations, setLang } =
    useTranslationStore();

  const t = (key: string, params: Record<string, string> = {}) => {
    const value = translations[key] || key;
    return Object.entries(params).reduce(
      (acc, [k, v]) => acc.replace(new RegExp(`{${k}}`, 'g'), v),
      value
    );
  };

  return { t, loading, error, fetchTranslations, setLang };
};
