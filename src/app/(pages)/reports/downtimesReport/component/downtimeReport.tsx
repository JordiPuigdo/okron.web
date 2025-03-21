'use client';
import 'react-datepicker/dist/react-datepicker.css';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { SvgSpinner } from 'app/icons/icons';
import {
  DowntimesReasonsType,
  OriginDowntime,
} from 'app/interfaces/Production/Downtimes';
import {
  DowntimesTicketReport,
  DowntimesTicketReportList,
  DowntimesTicketReportModel,
} from 'app/interfaces/Production/DowntimesTicketReport';
import {
  calculateTimeDifference,
  formatDate,
  translateDowntimeReasonType,
} from 'app/utils/utils';
import ca from 'date-fns/locale/ca';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Button } from 'designSystem/Button/Buttons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  calculateDowntimeCount,
  calculateTotalDowntimeMWO,
  calculateTotalDowntimes,
  calculateTotalDowntimesWorkOrder,
  filterAssets,
} from './downtimeUtils';

dayjs.extend(utc);
dayjs.extend(timezone);
interface DowntimeReportProps {
  downtimesTicketReport: DowntimesTicketReport[];
  from: Date;
  to: Date;
  setFrom: (date: Date) => void;
  setTo: (date: Date) => void;
  reloadData: () => void;
  isLoading: boolean;
}

const DowntimeReport: React.FC<DowntimeReportProps> = ({
  downtimesTicketReport,
  from,
  to,
  setFrom,
  setTo,
  reloadData,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());
  const [onlyTickets, setOnlyTickets] = useState(true);
  // const [onlyMaintenance, setOnlyMaintenance] = useState(false);
  const router = useRouter();

  const toggleExpand = (assetCode: string) => {
    setExpandedAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assetCode)) {
        newSet.delete(assetCode);
      } else {
        newSet.add(assetCode);
      }
      return newSet;
    });
  };

  const renderDowntimeTree = (
    report: DowntimesTicketReport[],
    level: number = 0
  ) => {
    return report.map((asset, assetIndex) => {
      const isExpanded = expandedAssets.has(asset.assetCode);
      const downtimeCount = calculateDowntimeCount([asset]);
      const totalTime = calculateTotalDowntimes([asset]);
      const totalTimeProd = calculateTotalDowntimes([asset], 'P');
      const totalTimeMaintenance = calculateTotalDowntimes([asset], 'M');

      const hasChildren = asset.assetChild && asset.assetChild.length > 0;

      return (
        <div
          key={assetIndex}
          className={`ml-${level * 4} border-l-4 border-gray-300 pl-4`}
        >
          <div
            className={`shadow-md rounded-lg p-4 bg-white border border-gray-200 mb-4`}
          >
            <div
              className={`flex items-center justify-between ${
                (hasChildren || downtimeCount > 0) && 'cursor-pointer'
              } ${
                downtimeCount > 0
                  ? 'border-2 border-black bg-orange-100 p-2 rounded-lg'
                  : ''
              }`}
              onClick={() =>
                (hasChildren || downtimeCount > 0) &&
                toggleExpand(asset.assetCode)
              }
            >
              <div className="flex flex-col w-full p-4 bg-gray-100 rounded-md">
                <div className="flex items-center gap-2">
                  {(hasChildren || downtimeCount > 0) && (
                    <span className="focus:outline-none rounded-full bg-blue-500 text-white px-2 py-1 cursor-pointer">
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  )}
                  <span className="text-xl font-bold text-gray-800">
                    {asset.assetCode} - {asset.assetDescription}
                  </span>
                  <span className="text-sm text-gray-500">Nivell: {level}</span>
                </div>

                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex-1 p-2 text-center bg-gray-200 rounded-md">
                    <span className="block text-sm text-gray-600">
                      Total Tickets
                    </span>
                    <span className="text-lg font-semibold">
                      {downtimeCount}
                    </span>
                  </div>
                  <div className="flex-1 p-2 text-center bg-yellow-200 rounded-md">
                    <span className="block text-sm text-gray-600">Temps</span>
                    <span className="text-lg font-semibold">{totalTime}</span>
                  </div>
                  <div className="flex-1 p-2 text-center bg-red-200 rounded-md">
                    <span className="block text-sm text-gray-600">
                      Producció
                    </span>
                    <span className="text-lg font-semibold">
                      {totalTimeProd}
                    </span>
                  </div>
                  <div className="flex-1 p-2 text-center bg-blue-200 rounded-md">
                    <span className="block text-sm text-gray-600">
                      Manteniment
                    </span>
                    <span className="text-lg font-semibold">
                      {totalTimeMaintenance}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="pl-4 mt-4">
                {asset.downtimesTicketReportList.map((workOrder, workIndex) => (
                  <div
                    key={workIndex}
                    className="bg-gray-100 rounded-lg p-3 shadow-inner"
                  >
                    <Link href={`/workOrders/${workOrder.workOrderId}`}>
                      <div className="flex flex-row gap-2 w-full items-center text-lg font-medium text-gray-800 mb-2 bg-gray-300 p-2 rounded-lg hover:bg-gray-400">
                        <span className="flex-1">
                          {workOrder.workOrderCode}
                        </span>
                        <span className="flex-1">
                          {workOrder.workOrderDescription}
                        </span>
                        <span className="flex-1">
                          {workOrder.downtimeReason}
                        </span>
                        <span className="flex-1 text-right">
                          {calculateTotalDowntimeMWO(
                            workOrder.downtimesWorkOrder
                          )}
                        </span>
                      </div>
                    </Link>
                    {RenderWorkOrderDetail(workOrder)}
                    <div className="flex w-full gap-2">
                      <div className="w-full p-2 justify-end bg-white rounded-lg font-semibold">
                        {calculateTotalDowntimesWorkOrder(
                          workOrder,
                          OriginDowntime.Production
                        )}
                      </div>
                      <div className="w-full p-2 justify-end font-semibold bg-white rounded-lg">
                        {calculateTotalDowntimesWorkOrder(
                          workOrder,
                          OriginDowntime.Maintenance
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {hasChildren && renderDowntimeTree(asset.assetChild, level + 1)}
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  const filteredData = filterAssets(
    downtimesTicketReport,
    searchQuery.toLowerCase(),
    onlyTickets
  );

  function RenderWorkOrderDetail(workOrder: DowntimesTicketReportList) {
    return (
      <div className="flex w-full">
        <div className={`flex flex-row w-full gap-2`}>
          <div className="w-full">
            {MapDowntimes(
              workOrder.downtimesWorkOrder.filter(
                x => x.originDownTime == OriginDowntime.Production
              )
            )}
          </div>
          <div className="w-full">
            {MapDowntimes(
              workOrder.downtimesWorkOrder.filter(
                x => x.originDownTime == OriginDowntime.Maintenance
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  function MapDowntimes(downtimes: DowntimesTicketReportModel[]) {
    return (
      <>
        {downtimes.map((downtime, downtimeIndex) => (
          <div
            key={downtimeIndex}
            className={`flex flex-row my-2 text-sm p-2 rounded shadow-sm gap-2 ${
              downtime.originDownTime === OriginDowntime.Production
                ? 'bg-red-700'
                : 'bg-blue-700'
            }`}
          >
            <div className="w-full flex flex-col border-r-2 gap-2">
              <div className="w-full flex gap-1 ">
                <span className="text-white font-bold">Inici:</span>
                <span className="text-white">
                  {formatDate(downtime.startTime)}
                </span>
                <span className="text-white font-bold">Final:</span>
                <span className="text-white">
                  {formatDate(downtime.endTime)}
                </span>
              </div>

              <div className="flex items-start gap-1">
                <span className="text-white font-semibold">Total:</span>
                <span className="text-white">
                  {calculateTimeDifference(
                    downtime.startTime,
                    downtime.endTime
                  )}
                </span>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="flex flex-col gap-2 items-end">
                <span className="text-white font-semibold">
                  {translateDowntimeReasonType(
                    downtime.originDownTime as unknown as DowntimesReasonsType
                  )}
                </span>
                <div className="flex flex-wrap">
                  <span className="text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[87px]">
                    {downtime.operator.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-4 bg-white rounded-xl p-4 shadow-md mb-12">
        <div className="w-full flex flex-row text-xl font-semibold p-2 items-center border-b-2 border-gray-300">
          <div className="flex cursor-pointer " onClick={() => router.back()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6 inline-block mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </div>
          <div className="flex w-full text-center justify-center">
            Report Tickets
          </div>
        </div>
        <div className="mb-6 ">
          <div className="flex gap-4 mb-4">
            <DatePicker
              selected={from}
              onChange={e => (e ? setFrom(e) : setFrom(new Date()))}
              locale={ca}
              dateFormat="dd/MM/yyyy"
              className="border border-gray-300 p-2 rounded-md mr-4 w-full"
              popperClassName="z-50"
            />
            <DatePicker
              selected={to}
              onChange={e => (e ? setTo(e) : setTo(new Date()))}
              dateFormat="dd/MM/yyyy"
              locale={ca}
              className="border border-gray-300 p-2 rounded-md mr-4 w-full"
              popperClassName="z-50"
            />

            <Button type="create" onClick={() => reloadData}>
              Buscar
            </Button>
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => setOnlyTickets(!onlyTickets)}
            >
              <div className="flex flex-col">
                <span>Només</span>
                <span>Tickets</span>
              </div>
              <input
                type="checkbox"
                className="flex cursor-pointer"
                checked={onlyTickets}
                onChange={e => setOnlyTickets(e.target.checked)}
              />
            </div>
            {/*<div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => setOnlyMaintenance(!onlyMaintenance)}
            >
              <div className="flex flex-col">
                <span>Intervenció</span>
                <span>Manteniment</span>
              </div>
              <input
                type="checkbox"
                className="flex cursor-pointer"
                checked={onlyMaintenance}
                onChange={e => setOnlyMaintenance(e.target.checked)}
              />
            </div>*/}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar per equip, codi d'operació o motiu"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>
      </div>
      {isLoading ? (
        <div className="flex container mx-auto p-6 items-center justify-center">
          <SvgSpinner className="text-okron-main" />
        </div>
      ) : (
        <>
          {downtimesTicketReport.length === 0 ? (
            <p className="text-center text-gray-500">
              No hi ha registres amb aquest filtre.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {renderDowntimeTree(filteredData)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DowntimeReport;
