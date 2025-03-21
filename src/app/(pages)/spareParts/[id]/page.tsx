'use client';
import { useEffect, useState } from 'react';
import { SparePartDetailResponse } from 'app/interfaces/SparePart';
import SparePartService from 'app/services/sparePartService';
import MainLayout from 'components/layout/MainLayout';

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
      <SparePartForm sparePartLoaded={sparePart?.sparePart} />
    </MainLayout>
  );
}
