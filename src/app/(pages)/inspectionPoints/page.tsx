'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgCreate, SvgMachines } from 'app/icons/icons';
import InspectionPointService from 'app/services/inspectionPointService';
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

import InspectionPoint from '../../interfaces/inspectionPoint';
import { InspectionPointFormModal } from './components/InspectionPointFormModal';

export default function InspectionPointsPage() {
  const { t } = useTranslations();
  const [inspectionPoints, setInspectionPoints] = useState<InspectionPoint[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedInspectionPoint, setSelectedInspectionPoint] = useState<
    InspectionPoint | undefined
  >(undefined);

  const getColumns = (): Column[] => [
    {
      label: t('common.id'),
      key: 'id',
      format: ColumnFormat.TEXT,
    },
    {
      label: t('description'),
      key: 'description',
      format: ColumnFormat.TEXT,
    },
    {
      label: t('active'),
      key: 'active',
      format: ColumnFormat.BOOLEAN,
    },
  ];

  const getFilters = (): Filters[] => [
    {
      key: 'description',
      label: t('description'),
      format: FiltersFormat.TEXT,
    },
  ];

  const tableButtons: TableButtons = {
    edit: true,
    delete: false,
  };

  const handleOpenCreateModal = () => {
    setSelectedInspectionPoint(undefined);
    setIsModalVisible(true);
  };

  const handleOpenEditModal = (inspectionPoint: InspectionPoint) => {
    setSelectedInspectionPoint(inspectionPoint);
    setIsModalVisible(true);
  };

  const handleModalSuccess = async () => {
    setIsModalVisible(false);
    setSelectedInspectionPoint(undefined);
    await fetchInspectionPoints();
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedInspectionPoint(undefined);
  };

  useEffect(() => {
    fetchInspectionPoints();
  }, []);

  async function fetchInspectionPoints() {
    try {
      const inspectionPointService = new InspectionPointService(
        process.env.NEXT_PUBLIC_API_BASE_URL || ''
      );
      const inspectionPointsData =
        await inspectionPointService.getAllInspectionPoints();
      setInspectionPoints(inspectionPointsData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching inspection points:', error);
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <div className="container mx-auto py-8">{t('loading')}</div>;
  }

  const renderHeader = () => {
    return (
      <div className="flex p-2 my-2">
        <div className="w-full flex flex-col gap-2 items">
          <h2 className="text-2xl font-bold text-black flex gap-2">
            <SvgMachines />
            {t('inspection.points')}
          </h2>
          <span className="text-l">
            {t('start')} - {t('inspection.points.list')}
          </span>
        </div>
        <div className="w-full flex justify-end items-center">
          <button
            onClick={handleOpenCreateModal}
            className="bg-okron-btCreate text-white font-semibold p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100 flex items-center gap-2"
          >
            <SvgCreate className="text-white" />
            {t('create.inspection.point')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <Container>
        <div className="flex flex-col h-full">
          {renderHeader()}
          <DataTable
            data={inspectionPoints}
            columns={getColumns()}
            filters={getFilters()}
            tableButtons={tableButtons}
            entity={EntityTable.INSPECTIONPOINTS}
            onEdit={handleOpenEditModal}
          />
        </div>
      </Container>

      <InspectionPointFormModal
        isVisible={isModalVisible}
        initialData={selectedInspectionPoint}
        onSuccess={handleModalSuccess}
        onCancel={handleModalCancel}
      />
    </MainLayout>
  );
}
