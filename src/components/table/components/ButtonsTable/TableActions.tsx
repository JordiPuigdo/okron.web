import { useState } from 'react';
import { SvgDelete, SvgDetail, SvgSpinner } from 'app/icons/icons';
import { LoginUser, UserPermission } from 'app/interfaces/User';
import { LoadingState } from 'app/types/loadingState';
import Link from 'next/link';

import { ButtonTypesTable } from '../../DataTable';
import { TableButtons } from '../../interface/interfaceTable';
import { EntityTable } from '../../interface/tableEntitys';
import { PreventiveButtons } from './PreventiveButtons';
import WorkOrderOperationsInTable from './WorkOrderOperationsInTable';

interface HeadTableActionsProps {
  tableButtons: TableButtons;
  entity: EntityTable;
}

export const HeadTableActions = ({
  tableButtons,
  entity,
}: HeadTableActionsProps) => {
  return tableButtons.delete ||
    tableButtons.detail ||
    tableButtons.edit ||
    entity === EntityTable.WORKORDER ? (
    <th className="text-center border-b border-blue-gray-100 bg-blue-gray-50 ">
      Accions
    </th>
  ) : (
    <></>
  );
};

interface TableButtonsComponentProps {
  item: any;
  isReport: boolean;
  tableButtons: TableButtons;
  entity: EntityTable;
  loginUser: LoginUser;
  pathDetail: string;
  onDelete?: (id: string) => void;
}

export const TableButtonsComponent = ({
  item,
  tableButtons,
  entity,
  loginUser,
  pathDetail,
  onDelete,
}: TableButtonsComponentProps) => {
  let colorRow = '';
  if (item.colorRow) {
    colorRow = item.colorRow;
  }

  return (
    <td className={`p-2 ${colorRow}`}>
      <div className="flex flex-row gap-2 justify-center">
        {entity != EntityTable.WORKORDER && (
          <TableButtonsComponentStandard
            entity={entity}
            item={item}
            loginUser={loginUser}
            pathDetail={pathDetail}
            tableButtons={tableButtons}
            onDelete={onDelete}
          />
        )}
        {entity == EntityTable.PREVENTIVE && (
          <PreventiveButtons preventive={item} userId={loginUser?.agentId} />
        )}
        {EntityTable.WORKORDER == entity && (
          <>
            <WorkOrderOperationsInTable
              workOrderId={item.id}
              workOrder={item}
              onChangeStateWorkOrder={() => {}}
              enableActions={tableButtons.edit || tableButtons.delete}
            />
          </>
        )}
      </div>
    </td>
  );
};

interface TableButtonsComponentStandardProps {
  item: any;
  tableButtons: TableButtons;
  entity: EntityTable;
  loginUser: LoginUser;
  pathDetail: string;
  onDelete?: (id: string) => void;
}

export const TableButtonsComponentStandard = ({
  item,
  tableButtons,
  loginUser,
  pathDetail,
  onDelete,
}: TableButtonsComponentStandardProps) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({});

  const toggleLoading = (
    id: string,
    buttonType: ButtonTypesTable,
    isLoading: boolean
  ) => {
    const loadingKey = `${id}_${buttonType}`;
    setLoadingState(prevLoadingState => ({
      ...prevLoadingState,
      [loadingKey]: isLoading,
    }));
  };

  const handleDelete = async (id: string) => {
    toggleLoading(id, ButtonTypesTable.Delete, true);
    onDelete && onDelete(id);
    toggleLoading(id, ButtonTypesTable.Delete, false);
  };

  const validPermission = [
    UserPermission.Administrator,
    UserPermission.SpareParts,
  ];

  const canEdit = validPermission.includes(loginUser?.permission!);
  return (
    <>
      {canEdit && (
        <>
          {tableButtons.edit && (
            <Link href={pathDetail} onClick={e => {}}>
              <p
                className="flex items-center font-medium text-white rounded-xl bg-okron-btEdit hover:bg-okron-btEditHover"
                onClick={() => {
                  toggleLoading(pathDetail, ButtonTypesTable.Edit, true);
                }}
              >
                {loadingState[pathDetail + '_' + ButtonTypesTable.Edit] ? (
                  <SvgSpinner className="p-2" />
                ) : (
                  <SvgDetail className="p-2" />
                )}
              </p>
            </Link>
          )}
          {tableButtons.delete && (
            <div
              className="flex items-center text-white rounded-xl bg-okron-btDelete hover:bg-okron-btDeleteHover hover:cursor-pointer"
              onClick={() => handleDelete(item.id)}
            >
              {loadingState[pathDetail + '_' + ButtonTypesTable.Delete] ? (
                <SvgSpinner className="p-2" />
              ) : (
                <SvgDelete className="p-2" />
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};
