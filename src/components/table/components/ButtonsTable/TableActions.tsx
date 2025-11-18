import { memo, useCallback } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgDelete, SvgDetail } from 'app/icons/icons';
import { LoginUser, UserPermission, UserType } from 'app/interfaces/User';
import Link from 'next/link';

import { TableButtons } from '../../interface/interfaceTable';
import { EntityTable } from '../../interface/tableEntitys';
import CRMStatusButton from './CRMStatusButton';
import { OrdersButtons } from './OrdersButtonts';
import WorkOrderOperationsInTable from './WorkOrderOperationsInTable';

interface HeadTableActionsProps {
  tableButtons: TableButtons;
  entity: EntityTable;
}

export const HeadTableActions = memo(
  ({ tableButtons, entity }: HeadTableActionsProps) => {
    const { t } = useTranslations();
    const showActions =
      tableButtons.delete ||
      tableButtons.detail ||
      tableButtons.edit ||
      entity === EntityTable.WORKORDER;

    if (!showActions) return null;

    return (
      <th className="text-center border-b border-blue-gray-100 bg-blue-gray-50">
        {t('actions')}
      </th>
    );
  }
);

HeadTableActions.displayName = 'HeadTableActions';

interface TableButtonsComponentProps {
  item: any;
  isReport: boolean;
  tableButtons: TableButtons;
  entity: EntityTable;
  loginUser: LoginUser;
  pathDetail: string;
  onDelete?: (id: string) => void;
}

export const TableButtonsComponent = memo(
  ({
    item,
    tableButtons,
    entity,
    loginUser,
    pathDetail,
    onDelete,
  }: TableButtonsComponentProps) => {
    const colorRow = item.colorRow || '';

    return (
      <td className={`${colorRow} p-4`}>
        <div className="flex flex-row gap-2 justify-center">
          {entity == EntityTable.DELIVERYNOTE && (
            <CRMStatusButton
              item={item}
              isCRM={loginUser?.userType === UserType.CRM}
            />
          )}
          {entity !== EntityTable.WORKORDER && (
            <TableButtonsComponentStandard
              entity={entity}
              item={item}
              loginUser={loginUser}
              pathDetail={pathDetail}
              tableButtons={tableButtons}
              onDelete={onDelete}
            />
          )}
          {entity === EntityTable.WORKORDER && (
            <WorkOrderOperationsInTable
              workOrderId={item.id}
              workOrder={item}
              onChangeStateWorkOrder={() => {}}
              enableActions={tableButtons.edit || tableButtons.delete}
            />
          )}
          {entity === EntityTable.ORDER && (
            <OrdersButtons orderId={item.id} order={item} />
          )}
        </div>
      </td>
    );
  }
);

TableButtonsComponent.displayName = 'TableButtonsComponent';

interface TableButtonsComponentStandardProps {
  item: any;
  tableButtons: TableButtons;
  entity: EntityTable;
  loginUser: LoginUser;
  pathDetail: string;
  onDelete?: (id: string) => void;
}

const validPermissions = [
  UserPermission.Administrator,
  UserPermission.SpareParts,
  UserPermission.AdminCRM,
];

export const TableButtonsComponentStandard = memo(
  ({
    item,
    tableButtons,
    loginUser,
    pathDetail,
    onDelete,
  }: TableButtonsComponentStandardProps) => {
    const canEdit = validPermissions.includes(loginUser?.permission!);

    if (!canEdit) return null;

    const showEdit = tableButtons.edit;
    const showDelete = tableButtons.delete;

    if (!showEdit && !showDelete) return null;

    return (
      <>
        {showEdit && <EditButton pathDetail={pathDetail} />}
        {showDelete && <DeleteButton item={item} onDelete={onDelete} />}
      </>
    );
  }
);

TableButtonsComponentStandard.displayName = 'TableButtonsComponentStandard';

// Componentes separados para mejor rendimiento
const EditButton = memo(({ pathDetail }: { pathDetail: string }) => (
  <Link href={pathDetail}>
    <p className="flex items-center font-medium text-white rounded-xl bg-okron-btEdit hover:bg-okron-btEditHover">
      <SvgDetail className="p-2 w-12 h-12" />
    </p>
  </Link>
));
EditButton.displayName = 'EditButton';

const DeleteButton = memo(
  ({ item, onDelete }: { item: any; onDelete?: (id: string) => void }) => {
    const handleDelete = useCallback(() => {
      onDelete && onDelete(item.id);
    }, [onDelete, item.id]);

    return (
      <div
        className="flex items-center font-medium text-white rounded-xl bg-okron-btDelete hover:bg-okron-btDeleteHover hover:cursor-pointer"
        onClick={handleDelete}
      >
        <SvgDelete className="p-2 w-12 h-12" />
      </div>
    );
  }
);
DeleteButton.displayName = 'DeleteButton';
