'use client';

import 'react-datepicker/dist/react-datepicker.css';

import ModalDowntimeReasons from 'app/(pages)/corrective/components/ModalDowntimeReasons';
import ModalGenerateCorrective from 'app/(pages)/corrective/components/ModalGenerateCorrective';
import { useTranslations } from 'app/hooks/useTranslations';
import { UserPermission } from 'app/interfaces/User';
import { StateWorkOrder, WorkOrderType } from 'app/interfaces/workOrder';
import { useSessionStore } from 'app/stores/globalStore';
import { CostsObject } from 'components/Costs/CostsObject';
import CompleteInspectionPoints from 'components/inspectionPoint/CompleteInspectionPoint';
import WorkOrderOperatorTimesComponent from 'components/operator/WorkOrderOperatorTimes';
import ChooseSpareParts from 'components/sparePart/ChooseSpareParts';

import DowntimesComponent from './Downtimes/Downtimes';
import { ModalChangeCustomer } from './ModalChangeCustomer/ModalChangeCustomer';
import {
  ContentCard,
  SectionHeader,
  TwoColumnLayout,
  useWorkOrderForm,
  WorkOrderEventsTable,
  WorkOrderHeader,
  WorkOrderMainForm,
  WorkOrderSidebar,
} from './WorkOrderForm';

// ============================================================================
// TYPES
// ============================================================================

type WorkOrderEditFormRefactoredProps = {
  id: string;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * WorkOrderEditFormRefactored - Versió refactoritzada del formulari d'edició d'OT.
 *
 * Millores implementades:
 * - Estructura modular amb components separats (SRP)
 * - Hook centralitzat per l'estat i accions
 * - Layout responsiu modern inspirat en apps socials
 * - Codi més mantenible i testeable
 * - Mateix comportament i lògica que l'original
 */
const WorkOrderEditFormRefactored: React.FC<
  WorkOrderEditFormRefactoredProps
> = ({ id }) => {
  const { t } = useTranslations();
  const { loginUser } = useSessionStore();

  // Custom hook que centralitza TOTA la lògica
  const { state, actions, form, permissions } = useWorkOrderForm({ id });

  // Destructuring per llegibilitat
  const {
    workOrder,
    isFinished,
    errorMessage,
    availableOperators,
    selectedOperators,
    selectedSpareParts,
    workOrderOperatorTimes,
    workOrderComments,
    workOrderEvents,
    passedInspectionPoints,
    startDate,
    costs,
    workOrderTimeExceeded,
    modals,
    loadingStates,
    isUpdatingCustomer,
  } = state;

  const {
    refresh,
    handleSubmit,
    handleDelete,
    selectOperator,
    removeOperator,
    handleStateChange,
    setStartDate,
    handleCustomerChange,
    selectDowntimeReason,
    openModal,
    closeModal,
    setSelectedSpareParts,
    setWorkOrderOperatorTimes,
    setWorkOrderComments,
    setPassedInspectionPoints,
  } = actions;

  const { isAdmin, isCRM, canEdit, filterOperatorTypes, getHeaderText } =
    permissions;

  // Loading state
  if (!workOrder) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-okron-primary mx-auto mb-4" />
          <p className="text-gray-600">{t('loading.data')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <WorkOrderHeader
        workOrder={workOrder}
        getHeaderText={getHeaderText}
        errorMessage={errorMessage}
      />

      {/* Main Content */}
      <div className="mt-4 px-2">
        <TwoColumnLayout
          main={
            <div className="space-y-4">
              {/* Main Form */}
              <WorkOrderMainForm
                workOrder={workOrder}
                register={form.register}
                isDisabled={!canEdit}
                isCRM={isCRM}
                timeExceeded={workOrderTimeExceeded}
                startDate={startDate}
                availableOperators={availableOperators}
                selectedOperators={selectedOperators}
                filterOperatorTypes={filterOperatorTypes}
                onSelectOperator={selectOperator}
                onRemoveOperator={removeOperator}
                onStateChange={handleStateChange}
                onDateChange={setStartDate}
                onChangeCustomer={() => openModal('changeCustomer')}
                onDowntimeReasonClick={() => openModal('downtimeReasons')}
                isUpdatingCustomer={isUpdatingCustomer}
              />

              {/* Costs Card */}
              {costs.total > 0 &&
                loginUser?.permission === UserPermission.Administrator && (
                  <ContentCard>
                    <CostsObject
                      operatorCosts={costs.operator}
                      sparePartCosts={costs.sparePart}
                      totalCosts={costs.total}
                    />
                  </ContentCard>
                )}

              {/* Downtimes Section */}
              {workOrder.downtimes && workOrder.downtimes.length > 0 && (
                <ContentCard>
                  <SectionHeader title={t('downtimes') || "Temps d'aturada"} />
                  <DowntimesComponent
                    downtimes={workOrder.downtimes}
                    workOrderId={workOrder.id}
                    currentWorkOrder={workOrder}
                    loginUser={loginUser}
                  />
                </ContentCard>
              )}

              {/* Operator Times Section */}
              {workOrder.workOrderType !== WorkOrderType.Ticket && (
                <ContentCard>
                  <SectionHeader title={t('workOrders.operatorTimes')} />
                  <WorkOrderOperatorTimesComponent
                    operators={availableOperators}
                    workOrderOperatortimes={workOrderOperatorTimes}
                    setWorkOrderOperatortimes={setWorkOrderOperatorTimes}
                    workOrderId={workOrder.id}
                    isFinished={isFinished}
                  />
                </ContentCard>
              )}

              {/* Inspection Points Section (Preventive only) */}
              {workOrder.workOrderType === WorkOrderType.Preventive && (
                <ContentCard>
                  <SectionHeader title={t('workOrders.inspectionPoints')} />
                  <CompleteInspectionPoints
                    workOrderInspectionPoints={passedInspectionPoints}
                    setCompletedWorkOrderInspectionPoints={
                      setPassedInspectionPoints
                    }
                    workOrderId={workOrder.id}
                    isFinished={
                      workOrder.stateWorkOrder === StateWorkOrder.Finished ||
                      workOrder.stateWorkOrder ===
                        StateWorkOrder.PendingToValidate ||
                      workOrder.stateWorkOrder === StateWorkOrder.Waiting
                    }
                    workOrder={workOrder}
                  />
                </ContentCard>
              )}

              {/* Spare Parts Section */}
              <ContentCard>
                <SectionHeader title={t('workOrders.spareParts')} />
                <ChooseSpareParts
                  selectedSpareParts={selectedSpareParts}
                  setSelectedSpareParts={setSelectedSpareParts}
                  workOrder={workOrder}
                  isFinished={isFinished}
                />
              </ContentCard>

              {/* Events Table (Admin only) */}
              {isAdmin && (
                <ContentCard>
                  <SectionHeader title={t('workOrders.events')} />
                  <WorkOrderEventsTable events={workOrderEvents} />
                </ContentCard>
              )}
            </div>
          }
          sidebar={
            <WorkOrderSidebar
              workOrder={workOrder}
              isAdmin={isAdmin}
              isCRM={isCRM}
              isFinished={isFinished}
              loadingStates={loadingStates}
              workOrderComments={workOrderComments}
              setWorkOrderComments={setWorkOrderComments}
              onSave={handleSubmit}
              onDelete={handleDelete}
              onCreateCorrective={() => openModal('generateCorrective')}
              onReload={refresh}
            />
          }
        />
      </div>

      {/* Modals */}
      {modals.downtimeReasons && (
        <ModalDowntimeReasons
          selectedId={workOrder.asset?.id || ''}
          onSelectedDowntimeReasons={reason => {
            selectDowntimeReason(reason);
            closeModal('downtimeReasons');
          }}
        />
      )}

      {modals.generateCorrective && (
        <ModalGenerateCorrective
          assetId={workOrder.asset?.id || ''}
          description={workOrder.description}
          stateWorkOrder={StateWorkOrder.OnGoing}
          operatorIds={workOrder.operatorId}
          originalWorkOrderId={workOrder.id}
          originalWorkOrderCode={workOrder.code}
        />
      )}

      {modals.changeCustomer && (
        <ModalChangeCustomer
          open={modals.changeCustomer}
          currentCustomerId={workOrder.customerWorkOrder?.customerId}
          currentInstallationId={
            workOrder.customerWorkOrder?.customerInstallationId
          }
          onClose={() => closeModal('changeCustomer')}
          onCustomerChanged={handleCustomerChange}
        />
      )}
    </div>
  );
};

export default WorkOrderEditFormRefactored;
