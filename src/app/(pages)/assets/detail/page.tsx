'use client';

import { useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { UserType } from 'app/interfaces/User';

import AssetHeader from './components/AssetHeaderComponent';
import SparePartsConsumedsComponent from './components/SparePartsConsumedComponent';
import WorkOrderContainer from './components/WorkOrderAssetContainer';

enum Tab {
  WORK_ORDERS = 'WORK_ORDERS',
  SPARE_PARTS = 'SPARE_PARTS',
}

export default function AssetDetailsQRPage({
  searchParams,
}: {
  searchParams: { id: string };
}) {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.WORK_ORDERS);

  const id = searchParams.id;
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(today.getMonth() - 10);
  const userType = UserType.Maintenance;
  return (
    <div className="min-h-screen flex flex-col">
      {/* Cabecera - fondo azul claro */}
      <AssetHeader assetId={id} />
      <div className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-md mx-auto flex border-b">
          {Object.values(Tab).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-center py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === tab
                  ? 'border-b-2 border-b-okron-main text-okron-main'
                  : 'text-gray-500 hover:text-blue-500'
              }`}
            >
              {tab === Tab.WORK_ORDERS ? t('work.orders') : t('spare.parts')}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido principal - fondo gris claro */}
      <main className="flex-grow bg-gray-50 p-4">
        <div className="max-w-md mx-auto gap-8 flex flex-col">
          <div className="bg-white rounded-lg shadow p-4">
            {activeTab === Tab.WORK_ORDERS && (
              <WorkOrderContainer
                assetId={id}
                operatorId={''}
                startDate={lastMonth}
                endDate={today}
                userType={userType}
                searchPreventive
              />
            )}

            {activeTab === Tab.SPARE_PARTS && (
              <SparePartsConsumedsComponent assetId={id} />
            )}
          </div>
        </div>
      </main>

      <footer className="bg-blue-50 p-3 border-t">
        <div className="max-w-md mx-auto text-center text-xs text-gray-500">
          {t('scanned.on')} {new Date().toLocaleDateString()}
        </div>
      </footer>
    </div>
  );
}
