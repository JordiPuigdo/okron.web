import { forwardRef, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useTranslations } from 'app/hooks/useTranslations';
import { GetDeviceTelemetryRequest } from 'app/interfaces/DeviceTelemetry';
import { deviceTelemetryService } from 'app/services/deviceTelemetryService';
import { enUS } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

interface DataCaptureFiltersProps {
  filters: GetDeviceTelemetryRequest;
  onFiltersChange: (filters: GetDeviceTelemetryRequest) => void;
}

interface DateInputProps {
  value?: string;
  onClick?: () => void;
}

const DateInput = forwardRef<HTMLButtonElement, DateInputProps>(
  ({ value, onClick }, ref) => (
    <button
      type="button"
      onClick={onClick}
      ref={ref}
      className="flex items-center gap-2 w-44 border border-ui-border rounded-md px-3 py-[7px] text-sm text-brand-primary bg-white hover:border-okron-main focus:outline-none focus:border-okron-main focus:ring-2 focus:ring-okron-main/15 transition-colors"
    >
      <Calendar className="h-4 w-4 text-okron-main shrink-0" />
      <span className={value ? 'text-brand-primary' : 'text-grey-70'}>
        {value ?? '—'}
      </span>
    </button>
  )
);
DateInput.displayName = 'DateInput';

function DataCaptureFilters({
  filters,
  onFiltersChange,
}: DataCaptureFiltersProps) {
  const { t } = useTranslations();
  const [deviceCodes, setDeviceCodes] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(
    filters.startDate ? new Date(filters.startDate) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    filters.endDate ? new Date(filters.endDate) : null
  );
  const [deviceCode, setDeviceCode] = useState<string>(
    filters.deviceCode ?? ''
  );

  useEffect(() => {
    deviceTelemetryService
      .getDeviceCodes()
      .then(setDeviceCodes)
      .catch(() => {});
  }, []);

  const handleApply = () => {
    onFiltersChange({
      deviceCode: deviceCode || undefined,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
    });
  };

  const handleClear = () => {
    setDeviceCode('');
    setStartDate(null);
    setEndDate(null);
    onFiltersChange({});
  };

  const datePickerDisplayProps = {
    locale: enUS,
    calendarStartDay: 0,
    formatWeekDay: (dayName: string) => dayName.slice(0, 2),
  };

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          {t('datacapture.device')}
        </label>
        <select
          value={deviceCode}
          onChange={e => setDeviceCode(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[180px]"
        >
          <option value="">—</option>
          {deviceCodes.map(code => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          {t('datacapture.startDate')}
        </label>
        <DatePicker
          {...datePickerDisplayProps}
          selected={startDate}
          onChange={setStartDate}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          showTimeSelect
          dateFormat="dd/MM/yyyy HH:mm"
          customInput={<DateInput />}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          {t('datacapture.endDate')}
        </label>
        <DatePicker
          {...datePickerDisplayProps}
          selected={endDate}
          onChange={setEndDate}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate ?? undefined}
          showTimeSelect
          dateFormat="dd/MM/yyyy HH:mm"
          customInput={<DateInput />}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-okron-main text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {t('filter')}
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          {t('clear')}
        </button>
      </div>
    </div>
  );
}

export default DataCaptureFilters;
