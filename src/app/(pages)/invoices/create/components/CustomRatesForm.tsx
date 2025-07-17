'use client';

import { InvoiceRateDto, OperatorType } from '../../../../interfaces/InvoiceInterfaces';

interface CustomRatesFormProps {
  customRates: InvoiceRateDto[];
  onRatesChange: (rates: InvoiceRateDto[]) => void;
  defaultRates: InvoiceRateDto[];
}

const CustomRatesForm: React.FC<CustomRatesFormProps> = ({
                                                           customRates,
                                                           onRatesChange,
                                                           defaultRates
                                                         }) => {
  const handleRateChange = (operatorType: OperatorType, newRate: number, description: string) => {
    const updatedRates = customRates.map(rate =>
      rate.operatorType === operatorType
        ? { ...rate, hourlyRate: newRate, description }
        : rate
    );
    onRatesChange(updatedRates);
  };

  const getOperatorTypeLabel = (type: OperatorType): string => {
    switch (type) {
      case OperatorType.Maintenance:
        return 'Manteniment';
      case OperatorType.Production:
        return 'Producció';
      case OperatorType.Quality:
        return 'Qualitat';
      default:
        return 'Desconegut';
    }
  };

  const getDefaultRate = (operatorType: OperatorType): InvoiceRateDto | undefined => {
    return defaultRates.find(rate => rate.operatorType === operatorType);
  };

  return (
    <div className="space-y-4">
      {customRates.map((rate, index) => {
        const defaultRate = getDefaultRate(rate.operatorType);
        const isModified = defaultRate ? rate.hourlyRate !== defaultRate.hourlyRate : false;

        return (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipus d'Operari
              </label>
              <input
                type="text"
                value={getOperatorTypeLabel(rate.operatorType)}
                readOnly
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarifa per Hora (€)
                {defaultRate && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Per defecte: {defaultRate.hourlyRate.toFixed(2)}€)
                  </span>
                )}
              </label>
              <input
                type="number"
                value={rate.hourlyRate}
                onChange={(e) => handleRateChange(
                  rate.operatorType,
                  parseFloat(e.target.value) || 0,
                  rate.description
                )}
                className={`w-full p-2 border rounded text-sm ${
                  isModified ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripció
              </label>
              <input
                type="text"
                value={rate.description}
                onChange={(e) => handleRateChange(
                  rate.operatorType,
                  rate.hourlyRate,
                  e.target.value
                )}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="Descripció de la tarifa"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CustomRatesForm;