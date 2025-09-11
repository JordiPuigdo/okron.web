'use client';

import { useState } from 'react';
import { TableDataDeliveryNotes } from 'app/(pages)/deliveryNotes/components/TableDataDeliveryNotes';
import { useTranslations } from 'app/hooks/useTranslations';
import { HeaderTable } from 'components/layout/HeaderTable';

import { TableDataInvoices } from './TableDataInvoices';

// Componentes que se muestran en las pestañas
function Invoices() {
  const { t } = useTranslations();
  
  return (
    <>
      <HeaderTable
        title={t('invoices')}
        subtitle={`${t('start')} - ${t('invoices.list')}`}
        createButton={t('create.invoice')}
        urlCreateButton="/invoices/create"
      />
      <TableDataInvoices className="bg-white p-4 rounded-xl shadow-md" />
    </>
  );
}

function DeliveryNotes() {
  const { t } = useTranslations();
  
  return (
    <>
      {' '}
      <HeaderTable
        title={t('delivery.notes')}
        subtitle={`${t('start')} - ${t('delivery.notes.list')}`}
        createButton={t('create.delivery.note')}
        urlCreateButton="/deliveryNotes/create"
      />
      <TableDataDeliveryNotes className="bg-white p-4 rounded-xl shadow-md" />
    </>
  );
}

type TabKey = 'Invoices' | 'DeliveryNotes';

const labels: Record<TabKey, string> = {
  DeliveryNotes: 'invoices.tabs.deliveryNotes',
  Invoices: 'invoices.tabs.invoices',
};

const components: Record<TabKey, JSX.Element> = {
  Invoices: <Invoices />,
  DeliveryNotes: <DeliveryNotes />,
};

const tabs: TabKey[] = ['DeliveryNotes', 'Invoices'];

export default function InvoiceTabPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('DeliveryNotes');
  const { t } = useTranslations();

  return (
    <div className="p-2 mt-4">
      {/* Botones de Tabs */}
      <div className="flex border-2 border-[#6E41B6] rounded-full overflow-hidden bg-white shadow-sm w-[30%]">
        {tabs.map((tab, idx) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                    flex-1 text-center text-base font-semibold transition
                    px-4 py-2 cursor-pointer
                    ${
                      active
                        ? 'bg-[#6E41B6] text-white shadow-md'
                        : 'text-[#6E41B6] bg-white'
                    }
                    hover:bg-[#6E41B6] hover:text-white
                    focus:outline-none focus:ring-2 focus:ring-[#6E41B6] focus:ring-offset-1
                    select-none
                    ${idx === 0 ? 'rounded-l-full' : ''}
                    ${idx === tabs.length - 1 ? 'rounded-r-full' : ''}
                    
                  `}
              aria-pressed={active}
              type="button"
            >
              {t(labels[tab])}
            </button>
          );
        })}
      </div>

      {components[activeTab]}
    </div>
  );
}
