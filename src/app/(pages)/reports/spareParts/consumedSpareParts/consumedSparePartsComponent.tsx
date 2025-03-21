'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { useSparePartsHook } from 'app/hooks/useSparePartsHook';
import { SvgSpinner } from 'app/icons/icons';
import ca from 'date-fns/locale/ca';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Button } from 'designSystem/Button/Buttons';
import { useRouter } from 'next/navigation';

import SparePartBarchart from './component/sparePartBarchart';
import SparePartsConsumedReportTable from './component/SparePartsConsumedReportTable';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function ConsumedSparePartsComponent() {
  const router = useRouter();
  const [from, setFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [to, setTo] = useState(new Date());

  const { sparePartsConsumeds, isLoading, isError, reloadSparePartsConsumeds } =
    useSparePartsHook().fetchSparePartsConsumedsHook(
      dayjs(from).format('YYYY-MM-DDTHH:mm:ss'),
      dayjs(to).format('YYYY-MM-DDTHH:mm:ss')
    );

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex flex-col gap-4 bg-white rounded-xl p-4 shadow-md">
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
            Històric de consums de recanvis
          </div>
        </div>
        <div className="flex gap-4">
          <DatePicker
            selected={from}
            onChange={e => (e ? setFrom(e) : setFrom(new Date()))}
            locale={ca}
            dateFormat="dd/MM/yyyy"
            className="border border-gray-300 p-2 rounded-md mr-4 w-full"
          />
          <DatePicker
            selected={to}
            onChange={e => (e ? setTo(e) : setTo(new Date()))}
            dateFormat="dd/MM/yyyy"
            locale={ca}
            className="border border-gray-300 p-2 rounded-md mr-4 w-full"
          />

          <Button type="create" onClick={() => reloadSparePartsConsumeds()}>
            Buscar
          </Button>
        </div>
      </div>
      {isLoading && (
        <div className="flex w-full text-white justify-center p-4">
          <SvgSpinner className="items-center justify-center" />
        </div>
      )}
      {isError && <div>Error loading spare parts consumeds</div>}

      {sparePartsConsumeds && sparePartsConsumeds?.length > 0 && (
        <>
          <SparePartsConsumedReportTable
            sparePartsConsumeds={sparePartsConsumeds}
          />
          <div className="w-full bg-white rounded-xl mt-2 p-4">
            <SparePartBarchart sparePartsConsumeds={sparePartsConsumeds} />
          </div>
        </>
      )}
    </div>
  );
}
