'use client';

import { useCallback, useState } from 'react';
import { useScheduledPreventives } from 'app/hooks/useScheduledPreventives';
import { useTranslations } from 'app/hooks/useTranslations';
import { ScheduledPreventiveItem } from 'app/interfaces/Preventive';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';
import { Calendar, Play, RefreshCw } from 'lucide-react';

import { ScheduledPreventivePreviewPanel } from './components/ScheduledPreventivePreviewPanel';
import { ScheduledPreventivesFiltersComponent } from './components/ScheduledPreventivesFilters';
import { ScheduledPreventivesTable } from './components/ScheduledPreventivesTable';

export default function ScheduledPreventivesPage() {
  const { t } = useTranslations();

  const {
    data,
    stats,
    filters,
    setFilters,
    availableAssets,
    availableOperators,
    availableMachines,
    selectedIds,
    toggleSelection,
    selectAllPending,
    clearSelection,
    launchSelected,
    launchSingle,
    refresh,
    isLoading,
    isLaunching,
    error,
  } = useScheduledPreventives();

  // Preview panel state
  const [previewItem, setPreviewItem] =
    useState<ScheduledPreventiveItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = useCallback((item: ScheduledPreventiveItem) => {
    setPreviewItem(item);
    setIsPreviewOpen(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false);
    setTimeout(() => setPreviewItem(null), 300);
  }, []);

  const handleLaunchSelected = useCallback(async () => {
    const result = await launchSelected();
    if (result.length > 0) {
      // Success - could show a toast notification here
    }
  }, [launchSelected]);

  const handleLaunchSingle = useCallback(
    async (item: ScheduledPreventiveItem) => {
      const result = await launchSingle(item);
      if (result) {
        // Update preview item with new state
        handleClosePreview();
      }
    },
    [launchSingle, handleClosePreview]
  );

  const renderHeader = () => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-gray-700" />
          <h2 className="text-xl font-bold text-gray-900">
            {t('preventive.scheduled.title') || 'Preventivos Programados'}
          </h2>
        </div>
        {/* Inline stats badges */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
            {stats.total} {t('common.total') || 'total'}
          </span>
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full font-medium">
            {stats.pending} {t('preventive.scheduled.pending') || 'pendientes'}
          </span>
          <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full font-medium">
            {stats.launched} {t('preventive.scheduled.launched') || 'lanzados'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Selection indicator */}
        {stats.selectedCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
            <span>{stats.selectedCount} {t('preventive.scheduled.selected') || 'seleccionados'}</span>
            <button
              onClick={clearSelection}
              className="text-blue-500 hover:text-blue-800 underline text-xs"
            >
              {t('common.clear') || 'Limpiar'}
            </button>
          </div>
        )}

        {/* Refresh button */}
        <button
          onClick={refresh}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title={t('common.refresh') || 'Actualizar'}
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>

        {/* Launch selected button */}
        <button
          onClick={handleLaunchSelected}
          disabled={stats.selectedPendingCount === 0 || isLaunching}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium"
        >
          {isLaunching ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('common.creating') || 'Creando...'}
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              {t('preventive.scheduled.createWorkOrders') || 'Crear OTs'}
              {stats.selectedPendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-green-500 rounded text-xs">
                  {stats.selectedPendingCount}
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <Container>
        <div className="flex flex-col flex-1 gap-3">
          {/* Header */}
          <div className="flex-shrink-0">{renderHeader()}</div>

          {/* Error message */}
          {error && (
            <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <span>{error}</span>
              <button
                onClick={refresh}
                className="ml-auto text-sm underline hover:no-underline"
              >
                {t('common.retry') || 'Reintentar'}
              </button>
            </div>
          )}

          {/* Filters - compact */}
          <div className="flex-shrink-0">
            <ScheduledPreventivesFiltersComponent
              filters={filters}
              setFilters={setFilters}
              availableAssets={availableAssets}
              availableOperators={availableOperators}
              availableMachines={availableMachines}
            />
          </div>
          {/* Table - grows to fill remaining space */}
          <ScheduledPreventivesTable
            data={data}
            selectedIds={selectedIds}
            onSelectionChange={toggleSelection}
            onSelectAll={selectAllPending}
            onClearSelection={clearSelection}
            onPreview={handlePreview}
            isLoading={isLoading}
          />
          {/* Preview Panel */}
          <ScheduledPreventivePreviewPanel
            item={previewItem}
            isOpen={isPreviewOpen}
            onClose={handleClosePreview}
            onLaunch={handleLaunchSingle}
            isLaunching={isLaunching}
          />
        </div>
      </Container>
    </MainLayout>
  );
}
