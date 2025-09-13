import { useTranslations } from 'app/hooks/useTranslations';

const BUTTONS = ['costs', 'spare.parts', 'work.orders', 'purchases'];

export default function ButtonsSections({
  selectedButton,
  handleButtonClick,
}: any) {
  const { t } = useTranslations();
  
  const getButtonText = (button: string) => {
    return t(button);
  };
  
  return (
    <div className="flex gap-4">
      {BUTTONS.map(button => (
        <button
          key={button}
          onClick={() => handleButtonClick(button)}
          className={`px-4 py-2 border-2 rounded-md text-lg font-semibold transition-colors duration-300 ${
            selectedButton === button
              ? 'bg-okron-main text-white border-okron-main'
              : 'text-okron-main border-okron-main'
          }`}
        >
          {getButtonText(button)}
        </button>
      ))}
    </div>
  );
}
