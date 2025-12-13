'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useCallback, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useOperatorHook } from 'app/hooks/useOperatorsHook';
import { useTimeTracking } from 'app/hooks/useTimeTracking';
import { useTranslations } from 'app/hooks/useTranslations';
import { TimeTracking } from 'app/interfaces/TimeTracking';
import Container from 'components/layout/Container';
import { HeaderTable } from 'components/layout/HeaderTable';
import MainLayout from 'components/layout/MainLayout';
import ca from 'date-fns/locale/ca';

import { TimeTrackingModal } from './components/CreateTimeTrackingModal';
import { TimeTrackingList } from './components/TimeTrackingList';

export default function ClockInOutPage() {
  const { t } = useTranslations();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingTimeTracking, setEditingTimeTracking] =
    useState<TimeTracking | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { searchTimeTrackings, timeTrackings, isLoading } = useTimeTracking();
  const { operators } = useOperatorHook();

  const handleSearch = useCallback(async () => {
    setIsSearching(true);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    await searchTimeTrackings({
      startDate: startOfDay,
      endDate: endOfDay,
      operatorId: selectedOperatorId || undefined,
    });
    setIsSearching(false);
  }, [selectedDate, selectedOperatorId]);

  // Ejecutar búsqueda automáticamente cuando cambien los filtros
  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleCreate = () => {
    setEditingTimeTracking(null);
    setShowModal(true);
  };

  const handleEdit = (timeTracking: TimeTracking) => {
    setEditingTimeTracking(timeTracking);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTimeTracking(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    handleSearch();
  };

  return (
    <MainLayout>
      <Container>
        <div className="p-6 max-w-7xl mx-auto">
          <HeaderTable
            title={t('clockInOut.title')}
            subtitle={t('clockInOut.subtitle')}
            createButton={t('clockInOut.createTimeTracking')}
            onCreate={handleCreate}
          />

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Selector de Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('date')}
                </label>
                <DatePicker
                  selected={selectedDate}
                  onChange={date => setSelectedDate(date || new Date())}
                  dateFormat="dd/MM/yyyy"
                  locale={ca}
                  maxDate={new Date()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  wrapperClassName="w-full"
                />
              </div>

              {/* Selector de Operario (Opcional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('operators')}
                </label>
                <select
                  value={selectedOperatorId}
                  onChange={e => setSelectedOperatorId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('allOperators')}</option>
                  {operators?.map(op => (
                    <option key={op.id} value={op.id}>
                      {op.code} - {op.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Fichajes */}
          <TimeTrackingList
            timeTrackings={timeTrackings}
            isLoading={isLoading || isSearching}
            onRefresh={handleSearch}
            onEdit={handleEdit}
          />

          {/* Modal de Crear/Editar Fichaje */}
          {showModal && (
            <TimeTrackingModal
              timeTracking={editingTimeTracking || undefined}
              onClose={handleCloseModal}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </Container>
    </MainLayout>
  );
}
