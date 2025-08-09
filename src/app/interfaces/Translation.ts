export type TranslationKey = string;
export type TranslationParams = Record<string, string | number>;

export interface TranslationData {
  lang: string;
  version: number;
  translations: Record<TranslationKey, string>;
}

export interface TranslationContextType {
  translations: TranslationData;
  loading: boolean;
  error: Error | null;
  loadTranslations: (lang: string, screen?: string) => Promise<void>;
  t: (key: TranslationKey, params?: TranslationParams) => string;
  currentLang: string;
}
