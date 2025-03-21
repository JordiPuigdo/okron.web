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

export default function AuthenticationPage() {
  const sectionService = new SectionService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );
  const [sections, setSections] = useState<Section[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const columns: Column[] = [
    {
      label: 'ID',
      key: 'id',
      format: ColumnFormat.TEXT,
    },
    {
      label: 'Codi',
      key: 'code',
      format: ColumnFormat.TEXT,
    },
    {
      label: 'Descripció',
      key: 'description',
      format: ColumnFormat.TEXT,
    },
  ];

  const tableButtons: TableButtons = {
    edit: true,
    delete: true,
  };

  const filters: Filters[] = [
    {
      key: 'code',
      label: 'Codi',
      format: FiltersFormat.TEXT,
    },
    {
      key: 'description',
      label: 'Descripció',
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
        console.error('Error fetching sections:', error);
      });
  }, []);

  return (
    <MainLayout>
      <Container>
        <div className="flex flex-col h-full">
          {renderHeader()}
          <DataTable
            data={sections}
            tableButtons={tableButtons}
            filters={filters}
            columns={columns}
            entity={EntityTable.SECTION}
          />
        </div>
      </Container>
    </MainLayout>
  );
}

const renderHeader = () => {
  return (
    <div className="flex p-2 my-2">
      <div className="w-full flex flex-col gap-2 items">
        <h2 className="text-2xl font-bold text-black flex gap-2">
          <SvgMachines />
          Seccions
        </h2>
        <span className="text-l">Inici - Llistat de Seccions</span>
      </div>
      <div className="w-full flex justify-end items-center">
        <Link
          href={{
            pathname: '/section/id',
          }}
          className="text-white mb-2 rounded-md bg-okron-btCreate hover:bg-okron-btCreateHover px-4 py-2 flex gap-2"
        >
          <SvgCreate className="text-white" />
          Crear Secció
        </Link>
      </div>
    </div>
  );
};
