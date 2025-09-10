import { useTranslations } from 'app/hooks/useTranslations';

const BUTTONS = ['Costos', 'Recanvis', 'Ordres de treball', 'Compres'];

export default function ButtonsSections({
  selectedButton,
  handleButtonClick,
}: any) {
  const { t } = useTranslations();
  
  const getButtonText = (button: string) => {
    switch (button) {
      case 'Costos':
        return t('costs');
      case 'Recanvis':
        return t('spare.parts');
      case 'Ordres de treball':
        return t('work.orders');
      case 'Compres':
        return t('purchases');
      default:
        return button;
    }
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
