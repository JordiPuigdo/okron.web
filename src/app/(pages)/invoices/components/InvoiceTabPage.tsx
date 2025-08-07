'use client';

import { useState } from 'react';
import { TableDataDeliveryNotes } from 'app/(pages)/deliveryNotes/components/TableDataDeliveryNotes';
import { useTranslations } from 'app/hooks/useTranslations';
import { HeaderTable } from 'components/layout/HeaderTable';

import { TableDataInvoices } from './TableDataInvoices';

// Componentes que se muestran en las pestañas
function Invoices() {
  return (
    <>
      <HeaderTable
        title="Factures"
        subtitle="Inici - Llistat de Factures"
        createButton="Crear Factura"
        urlCreateButton="/invoices/create"
      />
      <TableDataInvoices className="bg-white p-4 rounded-xl shadow-md" />
    </>
  );
}

function DeliveryNotes() {
  return (
    <>
      {' '}
      <HeaderTable
        title="Albarans"
        subtitle="Inici - Llistat d'Albarans"
        createButton="Crear Albarà"
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
    <div className="flex flex-col h-full mt-4">
      {/* Botones de Tabs */}
      <div className="flex border-2 border-[#6E41B6] rounded-full overflow-hidden bg-white shadow-sm w-[35%]">
        {tabs.map((tab, idx) => {
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

      {/* Contenido de la pestaña activa */}
      {components[activeTab]}
    </div>
  );
}
