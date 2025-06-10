'use client';
import { useEffect, useState } from 'react';
import { TableDataOrders } from 'app/(pages)/orders/components/TableDataOrders';
import { SparePartDetailResponse } from 'app/interfaces/SparePart';
import SparePartService from 'app/services/sparePartService';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import SparePartTable from '../components/SparePartTable';
import SparePartForm from '../sparePartForm/sparePartForm';

export default function page({ params }: { params: { id: string } }) {
  const sparePartService = new SparePartService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );
  const [sparePart, setSparePart] = useState<SparePartDetailResponse | null>(
    null
  );
  const fetchSparePart = async () => {
    const sparePart = await sparePartService.getSparePart({
      id: params.id,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
    });
    setSparePart(sparePart);
  };

  useEffect(() => {
    fetchSparePart();
  }, [params]);

  return (
    <MainLayout>
      <Container>
        <SparePartForm sparePartLoaded={sparePart?.sparePart} />
        {sparePart?.sparePart.id && (
          <div className="p-4 flex-grow rounded-md shadow-md bg-gray-200">
            <p className="font-semibold">Històric de consums</p>
            <SparePartTable
              sparePartId={sparePart!.sparePart.id}
              enableFilters={false}
              enableDetail={true}
              enableDelete={false}
              enableCreate={false}
              enableFilterActive={false}
            />
          </div>
        )}
        <div className="p-4 bg-white">
          <TableDataOrders
            sparePartId={sparePart?.sparePart.id}
            title="Històric de compres"
            hideShadow
          />
        </div>
      </Container>
    </MainLayout>
  );
}
