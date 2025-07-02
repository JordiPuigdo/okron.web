'use client';

import { useState } from 'react';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';
import { SettingsIcon } from 'lucide-react';

import PaymentMethodComponent from './paymentMethods/PaymentMethodComponent';
import RateConfigurationPage from './rates/components/Rate/RateComponent';
import RateTypeManager from './rates/components/RateType/RateTypeManager';

function SystemPage() {
  const [activeTab, setActiveTab] = useState('rateType');

  return (
    <MainLayout>
      <Container>
        <div className="p-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-8">
            <SettingsIcon className="w-6 h-6" />
            Configuración del sistema Okron
          </h1>

          <div className="flex border-2 border-[#6E41B6] rounded-full overflow-hidden bg-white shadow-sm w-[35%]">
            {(['rateType', 'rates', 'payment'] as const).map((tab, idx) => {
              const labels: Record<'rateType' | 'rates' | 'payment', string> = {
                rateType: 'Tipus de Tarifes',
                rates: 'Tarifes',
                payment: 'Pagament',
              };
              const active = activeTab === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    flex-1 text-center text-base font-semibold transition
                    px-4 py-2
                    cursor-pointer
                    ${
                      active
                        ? 'bg-[#6E41B6] text-white shadow-md'
                        : 'text-[#6E41B6] bg-white'
                    }
                    hover:bg-[#6E41B6] hover:text-white
                    focus:outline-none focus:ring-2 focus:ring-[#6E41B6] focus:ring-offset-1
                    select-none
                    ${idx === 0 ? 'rounded-l-full' : ''}
                    ${idx === 2 ? 'rounded-r-full' : ''}
                    
                  `}
                  aria-pressed={active}
                  type="button"
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          <div className="space-y-10 my-12">
            {activeTab === 'rateType' && <RateTypeManager />}
            {activeTab === 'rates' && <RateConfigurationPage />}
            {activeTab === 'payment' && <PaymentMethodComponent />}
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}

export default SystemPage;
