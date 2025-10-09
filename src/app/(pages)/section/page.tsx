'use client';

import { useEffect, useState } from 'react';
import { SvgCreate, SvgMachines, SvgSpinner } from 'app/icons/icons';
import Section from 'app/interfaces/Section';
import SectionService from 'app/services/sectionService';
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
import Link from 'next/link';

import { useTranslations } from '../../hooks/useTranslations';

export default function AuthenticationPage() {
  const sectionService = new SectionService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );
  const [sections, setSections] = useState<Section[]>([]);
  const {t} = useTranslations();
  const [isLoading, setIsLoading] = useState(false);

  const getColumns = (t: any): Column[] => [
    {
      label: 'ID',
      key: 'id',
      format: ColumnFormat.TEXT,
    },
    {
      label: t('code'),
      key: 'code',
      format: ColumnFormat.TEXT,
    },
    {
      label: t('description'),
      key: 'description',
      format: ColumnFormat.TEXT,
    },
  ];

  const tableButtons: TableButtons = {
    edit: true,
    delete: true,
  };

  const getFilters = (t: any): Filters[] => [
    {
      key: 'code',
      label: t('code'),
      format: FiltersFormat.TEXT,
    },
    {
      key: 'description',
      label: t('description'),
      format: FiltersFormat.TEXT,
    },
  ];

  useEffect(() => {
    sectionService
      .getSections()
      .then(sections => {
        setSections(sections);
      })
      .catch(error => {
        console.error(t('error.fetching.sections'), error);
      });
  }, []);

  return (
    <MainLayout>
      <Container>
        <div className="flex flex-col h-full">
          {renderHeader(t)}
          <DataTable
            data={sections}
            tableButtons={tableButtons}
            filters={getFilters(t)}
            columns={getColumns(t)}
            entity={EntityTable.SECTION}
          />
        </div>
      </Container>
    </MainLayout>
  );
}

const renderHeader = (t:any) => {
  return (
    <div className="flex p-2 my-2">
      <div className="w-full flex flex-col gap-2 items">
        <h2 className="text-2xl font-bold text-black flex gap-2">
          <SvgMachines />
          {t('sections')}
        </h2>
        <span className="text-l">{t('start')} - {t('sections.list')}</span>
      </div>
      <div className="w-full flex justify-end items-center">
        <Link
          href={{
            pathname: '/section/id',
          }}
          className="text-white mb-2 rounded-md bg-okron-btCreate hover:bg-okron-btCreateHover px-4 py-2 flex gap-2"
        >
          <SvgCreate className="text-white" />
          {t('create.section')}
        </Link>
      </div>
    </div>
  );
};
