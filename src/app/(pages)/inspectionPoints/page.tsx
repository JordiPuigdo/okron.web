'use client';

import { useCallback, useEffect, useState } from 'react';
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

export default function InspectionPointsPage() {
  const [inspectionPoints, setInspectionPoints] = useState<InspectionPoint[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };
  const [filterActive, setFilterActive] = useState(true);

  const columns: Column[] = [
    {
      label: 'ID',
      key: 'id',
      format: ColumnFormat.TEXT,
    },
    {
      label: 'Descripció',
      key: 'description',
      format: ColumnFormat.TEXT,
    },
    {
      label: 'Actiu',
      key: 'active',
      format: ColumnFormat.BOOLEAN,
    },
  ];

  const filters: Filters[] = [
    {
      key: 'description',
      label: 'Descripció',
      format: FiltersFormat.TEXT,
    },
  ];

  const tableButtons: TableButtons = {
    edit: true,
    delete: true,
  };
  const handleFormSubmit = async (e: React.FormEvent) => {
    setIsLoading(true);
    e.preventDefault();
    try {
      const inspectionPointService = new InspectionPointService(
        process.env.NEXT_PUBLIC_API_BASE_URL || ''
      );
      const newInspectionPoint =
        await inspectionPointService.createInspectionPoint({
          description: newDescription,
          id: '',
          active: true,
        });
      fetchInspectionPoints();

      setNewDescription('');
      setIsFormVisible(false);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error creating inspection point:', error);
    }
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

  const handleEditDescription = useCallback(
    async (id: string, description: string) => {
      try {
        const newDescription = prompt('Edita la descripció', description);
        if (newDescription === null) {
          return;
        }

        const inspectionPointService = new InspectionPointService(
          process.env.NEXT_PUBLIC_API_BASE_URL || ''
        );
        await inspectionPointService.updateInspectionPoint(id, {
          description: newDescription,
          id: id,
          active: true,
        });

        setInspectionPoints(prevInspectionPoints =>
          prevInspectionPoints.map(inspectionPoint =>
            inspectionPoint.id === id
              ? { ...inspectionPoint, description: newDescription }
              : inspectionPoint
          )
        );
      } catch (error) {
        console.error('Error updating inspection point description:', error);
      }
    },
    []
  );

  async function handleDeleteInspectionPoint(id: string) {
    try {
      const isConfirmed = window.confirm(
        "Segur que voleu eliminar aquest punt d'inspecció?"
      );
      if (isConfirmed) {
        const inspectionPointService = new InspectionPointService(
          process.env.NEXT_PUBLIC_API_BASE_URL || ''
        );
        await inspectionPointService.deleteInspectionPoint(id);
        setInspectionPoints(prevInspectionPoints =>
          prevInspectionPoints.filter(
            inspectionPoint => inspectionPoint.id !== id
          )
        );
        fetchInspectionPoints();
      }
    } catch (error) {
      console.error('Error deleting inspection point:', error);
    }
  }

  if (isLoading) {
    return <div className="container mx-auto py-8">Carregant...</div>;
  }

  const renderHeader = () => {
    return (
      <div className="flex p-2 my-2">
        <div className="w-full flex flex-col gap-2 items">
          <h2 className="text-2xl font-bold text-black flex gap-2">
            <SvgMachines />
            Punts d'Inspecció
          </h2>
          <span className="text-l">Inici - Llistat de Punts d'inspecció</span>
        </div>
        <div className="w-full flex justify-end items-center">
          <button
            onClick={toggleFormVisibility}
            className="bg-okron-btCreate text-white font-semibold p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100 flex items-center gap-2"
          >
            {!isFormVisible && <SvgCreate className="text-white" />}
            {isFormVisible ? 'Tancar' : "Crear Punt d'inspecció"}
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
          {isFormVisible && (
            <form onSubmit={handleFormSubmit} className="mb-4">
              <input
                type="text"
                placeholder="Escriu la descripció"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                className="border rounded py-2 px-3"
              />
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 ml-2 rounded"
              >
                Crear
              </button>
            </form>
          )}
          <DataTable
            data={inspectionPoints}
            columns={columns}
            filters={filters}
            tableButtons={tableButtons}
            entity={EntityTable.INSPECTIONPOINTS}
            onDelete={handleDeleteInspectionPoint}
          />
        </div>
      </Container>
    </MainLayout>
  );
}
