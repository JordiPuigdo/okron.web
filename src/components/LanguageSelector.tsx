import { useState } from 'react';
import { useTranslationStore } from 'app/stores/translationStore';

const LanguageSelector = () => {
  const { fetchTranslations, currentLang, setLang } = useTranslationStore();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: 'es', label: 'Español' },
    { code: 'ca', label: 'Català' },
  ];

  const handleChangeLang = async (lang: string) => {
    setLang(lang);
    await fetchTranslations(lang);
    setOpen(false);
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
        <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded shadow-lg z-50">
          {languages
            .sort(
              currentLang === 'ca'
                ? (a, b) => a.label.localeCompare(b.label)
                : (a, b) => b.label.localeCompare(a.label)
            )
            .map(lang => (
              <button
                key={lang.code}
                onClick={() => handleChangeLang(lang.code)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  currentLang === lang.code ? 'font-bold text-purple-700' : ''
                }`}
              >
                {lang.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
