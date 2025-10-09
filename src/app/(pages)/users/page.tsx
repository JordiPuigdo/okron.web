'use client';

import { useEffect, useState } from 'react';
import { SvgMachines, SvgSpinner } from 'app/icons/icons';
import { User } from 'app/interfaces/User';
import UserService from 'app/services/userService';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';
import DataTable from 'components/table/DataTable';
import {
  Column,
  ColumnFormat,
  Filters,
  FiltersFormat,
  TableButtons,
} from 'components/table/interface/interfaceTable';
import { EntityTable } from 'components/table/interface/tableEntitys';
import { Button } from 'designSystem/Button/Buttons';

import { useTranslations } from '../../hooks/useTranslations';

const getColumns = (t: any): Column[] => [
  {
    label: 'ID',
    key: 'id',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('users.username'),
    key: 'username',
    format: ColumnFormat.TEXT,
  },
  {
    label: t('active'),
    key: 'active',
    format: ColumnFormat.BOOLEAN,
  },
];

const getFilters = (t: any): Filters[] => [
  {
    key: 'description',
    label: t('description'),
    format: FiltersFormat.TEXT,
  },
];

const tableButtons: TableButtons = {
  edit: false,
  delete: false,
};
export default function UsersPage() {
  const {t} = useTranslations();
  const userService = new UserService(process.env.NEXT_PUBLIC_API_BASE_URL!);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);
  
  const columns = getColumns(t);
  const filters = getFilters(t);
  const fetchUsers = async () => {
    await userService.getUsers().then(data => {
      if (data) {
        setUsers(data);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  return (
    <MainLayout>
      <Container>
        <div className="flex flex-col h-full">
          {renderHeader(t)}
          {isLoading ? (
            <p>{t('loading')}</p>
          ) : (
            <DataTable
              data={users}
              columns={columns}
              filters={filters}
              tableButtons={tableButtons}
              entity={EntityTable.SECTION}
            />
          )}
        </div>
      </Container>
    </MainLayout>
  );
}

const renderHeader = (t:any) => {
  return (
    <div className="flex flex-col p-2 my-2">
      <div className="flex w-full">
        <div className="w-full flex flex-col gap-2 items">
          <h2 className="text-2xl font-bold text-black flex gap-2">
            <SvgMachines />
            {t('sidebar.users')}
          </h2>
          <span className="text-l">{t('users.listTitle')}</span>
        </div>
        <div className="w-full flex justify-end items-center"></div>
      </div>
    </div>
  );
};
