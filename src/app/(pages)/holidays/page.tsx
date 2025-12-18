'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useHolidays } from 'app/hooks/useHolidays';
import { useTranslations } from 'app/hooks/useTranslations';
import {
  HolidayCreateRequest,
  HolidayUpdateRequest,
} from 'app/interfaces/Holiday';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';
import { Modal } from 'designSystem/Modals/Modal';

import { HolidayForm } from './components/HolidayForm';
import { HolidaysTab } from './tabs/HolidaysTab';
import { VacationApprovalsTab } from './tabs/VacationApprovalsTab';
import { VacationSummaryTab } from './tabs/VacationSummaryTab';

type TabKey = 'Holidays' | 'VacationApprovals' | 'VacationSummary';

const tabs: TabKey[] = ['Holidays', 'VacationApprovals', 'VacationSummary'];

export default function HolidaysPage() {
  const { t } = useTranslations();

  const [activeTab, setActiveTab] = useState<TabKey>('Holidays');

  // ---- Modal State (solo para pestaña Holidays) ----
  const { createHoliday, updateHoliday } = useHolidays();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<any>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const refreshTableRef = useRef<(() => void) | null>(null);

  const handleRefreshRef = useCallback((refresh: () => void) => {
    refreshTableRef.current = refresh;
  }, []);

  // Cerrar modal cuando se cambia de tab
  useEffect(() => {
    setIsModalOpen(false);
    setEditingHoliday(null);
    setModalError(null);
  }, [activeTab]);

  const handleOpenCreate = () => {
    setEditingHoliday(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (holiday: any) => {
    setEditingHoliday(holiday);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmitHoliday = async (data: HolidayCreateRequest) => {
    setModalError(null);
    try {
      if (editingHoliday) {
        await updateHoliday({
          ...data,
          id: editingHoliday.id,
        } as HolidayUpdateRequest);
      } else {
        await createHoliday(data);
      }
      setIsModalOpen(false);
      // Refrescar la tabla
      if (refreshTableRef.current) {
        refreshTableRef.current();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error saving holiday';
      setModalError(errorMessage);
      console.error('Error saving holiday:', error);
    }
  };

  return (
    <MainLayout>
      <Container>
        {/* Tabs */}
        <div className="flex border-2 border-[#6E41B6] rounded-full overflow-hidden bg-white shadow-sm w-[60%] my-6">
          {tabs.map((tab, idx) => {
            const active = activeTab === tab;

            let label = '';
            if (tab === 'Holidays') {
              label = t('holidays.title');
            } else if (tab === 'VacationApprovals') {
              label = t('vacation.pendingApprovals');
            } else if (tab === 'VacationSummary') {
              label = t('vacation.summary');
            }

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  flex-1 px-4 py-2 text-base font-semibold transition
                  ${
                    active
                      ? 'bg-[#6E41B6] text-white'
                      : 'text-[#6E41B6] bg-white'
                  }
                  hover:bg-[#6E41B6] hover:text-white
                  ${idx === 0 ? 'rounded-l-full' : ''}
                  ${idx === tabs.length - 1 ? 'rounded-r-full' : ''}
                `}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'Holidays' && (
          <HolidaysTab
            onCreate={handleOpenCreate}
            onEdit={handleOpenEdit}
            onRefreshRef={handleRefreshRef}
          />
        )}

        {activeTab === 'VacationApprovals' && <VacationApprovalsTab />}

        {activeTab === 'VacationSummary' && <VacationSummaryTab />}

        {/* Modal Holidays */}
        <Modal
          isVisible={isModalOpen}
          type="center"
          height="h-auto"
          width="w-full"
          className="max-w-lg mx-auto border-4 border-blue-950 p-4"
          avoidClosing={true}
          onClose={() => {
            setIsModalOpen(false);
            setModalError(null);
          }}
          title={editingHoliday ? t('holidays.edit') : t('holidays.create')}
        >
          <HolidayForm
            key={editingHoliday?.id || 'new'}
            holiday={editingHoliday}
            onSubmit={handleSubmitHoliday}
            onCancel={() => {
              setIsModalOpen(false);
              setModalError(null);
            }}
            error={modalError}
          />
        </Modal>
      </Container>
    </MainLayout>
  );
}
