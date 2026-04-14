import { useEffect, useState } from 'react';
import ConfigService from 'app/services/configService';
import { useTranslationStore } from 'app/stores/translationStore';

// Mapa de codis d'idioma a etiquetes
const languageLabels: Record<string, string> = {
  es: 'Español',
  ca: 'Català',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  eu: 'Euskara',
  gl: 'Galego',
};

const LanguageSelector = () => {
  const { fetchTranslations, currentLang, setLang } = useTranslationStore();
  const [open, setOpen] = useState(false);
  const [languages, setLanguages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const configService = new ConfigService(
          process.env.NEXT_PUBLIC_API_BASE_URL || ''
        );
        const langs = await configService.getLanguages();
        setLanguages(langs);

        if (langs.length === 1) {
          await handleChangeLang(langs[0]);
        } else if (langs.length > 1 && !langs.includes(currentLang)) {
          await handleChangeLang(langs[0]);
        }
      } catch (error) {
        console.error('Error loading languages:', error);
        setLanguages([currentLang || 'es']);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguages();
  }, []);

  const handleChangeLang = async (lang: string) => {
    setLang(lang);
    await fetchTranslations(lang);
    setOpen(false);
  };

  const getLanguageLabel = (code: string): string => {
    return languageLabels[code] || code.toUpperCase();
  };

  return (
    <div className="relative ml-2">
      <button
        onClick={() => setOpen(!open)}
        className="p-1 hover:text-purple-900"
        title="Cambiar idioma"
      >
        🌐
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg z-50">
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">...</div>
          ) : (
            languages.map(langCode => (
              <button
                key={langCode}
                onClick={() => handleChangeLang(langCode)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  currentLang === langCode ? 'font-bold text-purple-700' : ''
                }`}
              >
                {getLanguageLabel(langCode)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
