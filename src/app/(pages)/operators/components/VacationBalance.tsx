'use client';

import { useTranslations } from 'app/hooks/useTranslations';
import { VacationBalance as VacationBalanceType } from 'app/interfaces/Vacation';

interface VacationBalanceProps {
  balance: VacationBalanceType;
}

export const VacationBalance = ({ balance }: VacationBalanceProps) => {
  const { t } = useTranslations();

  const usedPercentage =
    balance.totalHours > 0
      ? (balance.usedHours / balance.totalHours) * 100
      : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">{t('vacation.balance')}</h3>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">
            {balance.totalDays}
          </div>
          <div className="text-sm text-blue-400">{balance.totalHours} h</div>
          <div className="text-sm text-gray-600 mt-1">{t('vacation.total')}</div>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-3xl font-bold text-green-600">
            {balance.availableDays}
          </div>
          <div className="text-sm text-green-400">{balance.availableHours} h</div>
          <div className="text-sm text-gray-600 mt-1">{t('vacation.available')}</div>
        </div>

        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-3xl font-bold text-orange-600">
            {balance.usedDays}
          </div>
          <div className="text-sm text-orange-400">{balance.usedHours} h</div>
          <div className="text-sm text-gray-600 mt-1">{t('vacation.used')}</div>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 transition-all duration-300"
          style={{ width: `${Math.min(usedPercentage, 100)}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 text-right mt-1">
        {usedPercentage.toFixed(1)}% {t('vacation.used')}
      </div>
    </div>
  );
};
