'use client';
import { useEffect, useState } from 'react';
import { FaHistory } from 'react-icons/fa';
import { TableDataOrders } from 'app/(pages)/orders/components/TableDataOrders';
import { OrderType } from 'app/interfaces/Order';
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

  const [activeTab, setActiveTab] = useState('compres');

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
          <div className="p-4 flex-grow rounded-md shadow-md bg-white">
            <div className="flex items-center mb-4 space-x-2">
              <FaHistory className="text-xl text-gray-700" />

              <h2 className="text-lg font-semibold text-gray-800">Històric</h2>
            </div>

            <div className="flex mb-6 border-2 border-[#6E41B6] rounded-full w-fit overflow-hidden">
              <button
                onClick={() => setActiveTab('compres')}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                  activeTab === 'compres'
                    ? 'bg-[#6E41B6] text-white'
                    : 'bg-white text-[#6E41B6]'
                }`}
              >
                Compres
              </button>
              <button
                onClick={() => setActiveTab('consums')}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                  activeTab === 'consums'
                    ? 'bg-[#6E41B6] text-white'
                    : 'bg-white text-[#6E41B6]'
                }`}
              >
                Consums
              </button>
            </div>
            <div className="transition-all duration-300 ease-in-out bg-white">
              {activeTab === 'consums' && (
                <div className="animate-fadeIn">
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

              {activeTab === 'compres' && (
                <div className="animate-fadeIn">
                  <TableDataOrders
                    orderType={OrderType.Purchase}
                    sparePartId={sparePart?.sparePart.id}
                    title=""
                    hideShadow
                    enableFilters={false}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </Container>
    </MainLayout>
  );
}
