'use client';

import { useState } from 'react';
import { TableDataDeliveryNotes } from 'app/(pages)/deliveryNotes/components/TableDataDeliveryNotes';
import { useTranslations } from 'app/hooks/useTranslations';
import { HeaderTable } from 'components/layout/HeaderTable';

import { BudgetCreateModal } from './BudgetCreateModal';
import { TableDataBudgets } from './TableDataBudgets';
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

function Budgets({
  onOpenCreateModal,
}: {
  onOpenCreateModal: () => void;
}) {
  const { t } = useTranslations();
  
  return (
    <>
      <HeaderTable
        title={t('budgets')}
        subtitle={`${t('start')} - ${t('budgets.list')}`}
        createButton={t('create.budget')}
        onCreate={onOpenCreateModal}
      />
      <TableDataBudgets className="bg-white p-4 rounded-xl shadow-md" />
    </>
  );
}

type TabKey = 'Invoices' | 'DeliveryNotes' | 'Budgets';

const labels: Record<TabKey, string> = {
  Budgets: 'invoices.tabs.budgets',
  DeliveryNotes: 'invoices.tabs.deliveryNotes',
  Invoices: 'invoices.tabs.invoices',
};

const tabs: TabKey[] = ['Budgets', 'DeliveryNotes', 'Invoices'];

export default function InvoiceTabPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('Budgets');
  const [isCreateBudgetModalOpen, setIsCreateBudgetModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { t } = useTranslations();

  const handleBudgetCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Invoices':
        return <Invoices />;
      case 'DeliveryNotes':
        return <DeliveryNotes />;
      case 'Budgets':
        return (
          <Budgets
            key={refreshKey}
            onOpenCreateModal={() => setIsCreateBudgetModalOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-2 mt-4">
      {/* Modal de crear presupuesto */}
      <BudgetCreateModal
        isOpen={isCreateBudgetModalOpen}
        onClose={() => setIsCreateBudgetModalOpen(false)}
        onSuccess={handleBudgetCreated}
      />

      {/* Botones de Tabs */}
      <div className="flex border-2 border-[#6E41B6] rounded-full overflow-hidden bg-white shadow-sm w-[45%]">
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

      {renderTabContent()}
    </div>
  );
}
