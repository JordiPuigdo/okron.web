'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { SystemConfiguration } from 'app/interfaces/Config';
import WorkOrder, { WorkOrderType } from 'app/interfaces/workOrder';
import Loader from 'components/Loader/loader';

import { HoursOperator } from './components/hoursOperator';
import ReportDataCard from './components/ReportDataCard';
import { Signatures } from './components/Signature';
import { WorkOrderComment } from './components/workorderComment';
import { WorkOrderHeader } from './components/workorderHeader';
import { WorkOrderPreventiveReport } from './components/workorderPreventiveReport';
import { WorkOrderSparePartsReport } from './components/workorderSparePartsReport';

async function getWorkOrders(id: string): Promise<WorkOrder> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}workOrder/${id}`;
    const res = await fetch(url, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch work orders ' + url + ' ' + res.status);
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching work orders:', error);
    return {} as WorkOrder;
  }
}

async function getConfig() {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}config`;

    const res = await fetch(url, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch config');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching config:', error);
    return {} as SystemConfiguration;
  }
}

interface WorkOrderPageProps {
  searchParams: { id: string; parentId?: string };
}

export default function WorkOrderPage({ searchParams }: WorkOrderPageProps) {
  const { t } = useTranslations();
  const [orders, setOrders] = useState<WorkOrder | null>(null);
  const [config, setConfig] = useState<SystemConfiguration | null>(null);

  useEffect(() => {
    const loadData = async () => {
      console.log('params', searchParams);
      const workOrderData = await getWorkOrders(searchParams.id);
      const configData = await getConfig();
      setOrders(workOrderData);
      setConfig(configData);
    };
    loadData();
  }, [searchParams.id]);

  useEffect(() => {
    if (orders && config) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [orders, config]);

  if (!orders || !config) return <Loader />;

  if (config.isCRM) {
    return (
      <div className="px-2 sm:px-4 max-w-[100vw] overflow-x-hidden text-sm">
        <div className="flex flex-col bg-white p-4 w-full gap-6">
          <WorkOrderHeader workOrder={orders} config={config} />
          <ReportDataCard workOrder={orders} />
          {orders.customerSign && orders.workerSign && (
            <Signatures
              customerSign={orders.customerSign}
              workerSign={orders.workerSign}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 max-w-[100vw] overflow-x-hidden text-sm">
      <div>
        {orders == undefined && <Loader />}
        <WorkOrderHeader workOrder={orders} config={config} />
        <HoursOperator workOrder={orders} />
        {orders.workOrderType == WorkOrderType.Preventive && (
          <WorkOrderPreventiveReport workorder={orders} />
        )}
        <WorkOrderSparePartsReport workorder={orders} />
        <WorkOrderComment workorder={orders} />
        <div className="flex font-semibold p-10">{t('signature')}:</div>
      </div>
    </div>
  );
}
