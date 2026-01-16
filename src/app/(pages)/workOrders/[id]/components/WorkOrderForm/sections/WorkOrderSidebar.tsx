'use client';

import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSave } from 'app/icons/designSystem/SvgSave';
import { SvgClose, SvgSpinner } from 'app/icons/icons';
import { UserType } from 'app/interfaces/User';
import WorkOrder, {
  WorkOrderComment,
  WorkOrderType,
} from 'app/interfaces/workOrder';
import { useSessionStore } from 'app/stores/globalStore';
import useRoutes from 'app/utils/useRoutes';
import WorkOrderOperatorComments from 'components/operator/WorkOrderCommentOperator';
import { Button } from 'designSystem/Button/Buttons';
import {
  AlertTriangle,
  Eye,
  FileText,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';

import WorkOrderButtons from '../../WorkOrderButtons';
import { ContentCard, ContentCardHeader } from '../layout';

// ============================================================================
// TYPES
// ============================================================================

interface WorkOrderActionsProps {
  workOrder: WorkOrder;
  // Permissions
  isAdmin: boolean;
  isCRM: boolean;
  // Loading states
  loadingStates: Record<string, boolean>;
  // Actions
  onSave: () => void;
  onDelete: () => void;
  onCreateCorrective: () => void;
  // Handlers from WorkOrderButtons
  onReload: () => Promise<void>;
}

interface WorkOrderCommentsCardProps {
  workOrderComments: WorkOrderComment[];
  workOrderId: string;
  isFinished: boolean;
  setWorkOrderComments: React.Dispatch<
    React.SetStateAction<WorkOrderComment[]>
  >;
}

interface WorkOrderSidebarProps {
  workOrder: WorkOrder;
  // Permissions
  isAdmin: boolean;
  isCRM: boolean;
  isFinished: boolean;
  // Loading
  loadingStates: Record<string, boolean>;
  // Comments
  workOrderComments: WorkOrderComment[];
  setWorkOrderComments: React.Dispatch<
    React.SetStateAction<WorkOrderComment[]>
  >;
  // Actions
  onSave: () => void;
  onDelete: () => void;
  onCreateCorrective: () => void;
  onReload: () => Promise<void>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * WorkOrderSidebar - Columna lateral amb accions i comentaris.
 *
 * Conté:
 * - Botons d'acció principals (Guardar, Eliminar)
 * - Botons contextuals (WorkOrderButtons)
 * - Comentaris
 */
export function WorkOrderSidebar({
  workOrder,
  isAdmin,
  isCRM,
  isFinished,
  loadingStates,
  workOrderComments,
  setWorkOrderComments,
  onSave,
  onDelete,
  onCreateCorrective,
  onReload,
}: WorkOrderSidebarProps) {
  return (
    <div className="space-y-4">
      {/* Quick Actions Card */}
      <QuickActionsCard
        workOrder={workOrder}
        isAdmin={isAdmin}
        isCRM={isCRM}
        loadingStates={loadingStates}
        onSave={onSave}
        onDelete={onDelete}
        onCreateCorrective={onCreateCorrective}
        onReload={onReload}
      />

      {/* Comments Card */}
      <CommentsCard
        workOrderComments={workOrderComments}
        workOrderId={workOrder.id}
        isFinished={isFinished}
        setWorkOrderComments={setWorkOrderComments}
      />
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function QuickActionsCard({
  workOrder,
  isAdmin,
  isCRM,
  loadingStates,
  onSave,
  onDelete,
  onCreateCorrective,
  onReload,
}: WorkOrderActionsProps) {
  const { t } = useTranslations();
  const { loginUser } = useSessionStore();

  const canCreateCorrective =
    (workOrder.workOrderType === WorkOrderType.Ticket &&
      loginUser?.userType === UserType.Maintenance &&
      !workOrder.workOrderCreatedId) ||
    (workOrder.workOrderType === WorkOrderType.Preventive &&
      workOrder.preventive?.id != undefined);

  return (
    <ContentCard>
      <ContentCardHeader>
        <h3 className="font-semibold text-gray-900">{t('actions')}</h3>
      </ContentCardHeader>

      {/* Main Action Buttons */}
      <div className="space-y-3">
        {/* WorkOrderButtons (Play/Pause/Finish) */}
        <WorkOrderButtons workOrder={workOrder} handleReload={onReload} />

        {/* Admin Actions */}
        {isAdmin && (
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            {/* Save */}
            <Button
              onClick={onSave}
              type="create"
              customStyles="flex-1 flex items-center justify-center gap-2"
            >
              {loadingStates['SAVE'] ? (
                <SvgSpinner className="text-white w-4 h-4" />
              ) : (
                <SvgSave className="text-white w-4 h-4" />
              )}
            </Button>

            {/* Delete */}
            <Button
              onClick={onDelete}
              type="delete"
              customStyles="flex items-center justify-center"
            >
              {loadingStates['DELETE'] ? (
                <SvgSpinner className="text-white w-4 h-4" />
              ) : (
                <SvgClose className="text-white w-4 h-4" />
              )}
            </Button>
          </div>
        )}

        {/* Secondary Actions */}
        <SecondaryActions
          workOrder={workOrder}
          isAdmin={isAdmin}
          isCRM={isCRM}
          loadingStates={loadingStates}
          canCreateCorrective={canCreateCorrective}
          onCreateCorrective={onCreateCorrective}
        />
      </div>
    </ContentCard>
  );
}

interface SecondaryActionsProps {
  workOrder: WorkOrder;
  isAdmin: boolean;
  isCRM: boolean;
  loadingStates: Record<string, boolean>;
  canCreateCorrective: boolean;
  onCreateCorrective: () => void;
}

function SecondaryActions({
  workOrder,
  isAdmin,
  isCRM,
  loadingStates,
  canCreateCorrective,
  onCreateCorrective,
}: SecondaryActionsProps) {
  const { t } = useTranslations();
  const Routes = useRoutes();

  const hasSecondaryActions =
    isAdmin ||
    canCreateCorrective ||
    workOrder.originalWorkOrderId ||
    workOrder.workOrderCreatedId;

  if (!hasSecondaryActions) return null;

  return (
    <div className="pt-3 border-t border-gray-100 space-y-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {t('more.actions') || 'Més accions'}
      </p>

      <div className="flex flex-wrap gap-2">
        {/* See Asset */}
        {isAdmin && !isCRM && workOrder.asset?.id && (
          <Link href={`${Routes.configuration.assets}/${workOrder.asset.id}`}>
            <SecondaryButton
              icon={<Eye className="w-3.5 h-3.5" />}
              label={t('see.asset')}
              loading={loadingStates['SEEACTIVE']}
            />
          </Link>
        )}

        {/* See Preventive */}
        {isAdmin &&
          workOrder.workOrderType === WorkOrderType.Preventive &&
          workOrder.preventive?.id && (
            <Link
              href={`${Routes.preventive.configuration}/${workOrder.preventive.id}`}
            >
              <SecondaryButton
                icon={<FileText className="w-3.5 h-3.5" />}
                label={t('see.preventive')}
                loading={loadingStates['SEEPREVENTIVE']}
              />
            </Link>
          )}

        {/* Create Corrective */}
        {canCreateCorrective && (
          <SecondaryButton
            icon={<AlertTriangle className="w-3.5 h-3.5" />}
            label={t('create.corrective')}
            onClick={onCreateCorrective}
            variant="danger"
          />
        )}

        {/* See Original Ticket */}
        {workOrder.originalWorkOrderId && (
          <Link href={`/workOrders/${workOrder.originalWorkOrderId}`}>
            <SecondaryButton
              icon={<FileText className="w-3.5 h-3.5" />}
              label={t('see.ticket')}
              variant="success"
            />
          </Link>
        )}

        {/* See Created Corrective */}
        {workOrder.workOrderCreatedId && (
          <Link href={`/workOrders/${workOrder.workOrderCreatedId}`}>
            <SecondaryButton
              icon={<Wrench className="w-3.5 h-3.5" />}
              label={t('see.corrective')}
              variant="success"
            />
          </Link>
        )}
      </div>
    </div>
  );
}

interface SecondaryButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  loading?: boolean;
  variant?: 'default' | 'danger' | 'success';
}

function SecondaryButton({
  icon,
  label,
  onClick,
  loading,
  variant = 'default',
}: SecondaryButtonProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-100 text-red-700 hover:bg-red-200',
    success: 'bg-green-100 text-green-700 hover:bg-green-200',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
        transition-colors
        ${variantClasses[variant]}
      `}
    >
      {loading ? <SvgSpinner className="w-3.5 h-3.5 animate-spin" /> : icon}
      <span>{label}</span>
    </button>
  );
}

function CommentsCard({
  workOrderComments,
  workOrderId,
  isFinished,
  setWorkOrderComments,
}: WorkOrderCommentsCardProps) {
  const { t } = useTranslations();

  return (
    <ContentCard>
      <ContentCardHeader>
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          {t('workOrders.comments')}
          {workOrderComments.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-okron-primary text-white rounded-full">
              {workOrderComments.length}
            </span>
          )}
        </h3>
      </ContentCardHeader>

      <WorkOrderOperatorComments
        workOrderComments={workOrderComments}
        workOrderId={workOrderId}
        isFinished={isFinished}
        setWorkOrderComments={setWorkOrderComments}
      />
    </ContentCard>
  );
}
