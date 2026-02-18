import DatePicker from 'react-datepicker';
import { ContentCard } from 'app/(pages)/workOrders/[id]/components/WorkOrderForm/layout/ContentCard';
import ca from 'date-fns/locale/ca';
import OkronTimePicker from 'designSystem/TimePicker/OkronTimePicker';

interface ScheduleSectionProps {
  preventiveDays: number;
  startDate: Date | null;
  timeExecution?: Date | null;
  lastExecution?: string;
  onDaysChange: (days: number) => void;
  onStartDateChange: (date: Date) => void;
  onTimeChange?: (time: string) => void;
  isDisabled?: boolean;
  showLastExecution?: boolean;
}

export function ScheduleSection({
  preventiveDays,
  startDate,
  timeExecution,
  lastExecution,
  onDaysChange,
  onStartDateChange,
  onTimeChange,
  isDisabled = false,
  showLastExecution = false,
}: ScheduleSectionProps) {
  return (
    <ContentCard>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Planificació
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label
            className="block text-gray-700 font-bold mb-2 text-sm"
            htmlFor="days"
          >
            Freqüència Dies
          </label>
          <input
            value={preventiveDays}
            onChange={e => onDaysChange(parseInt(e.target.value) || 0)}
            id="days"
            type="number"
            disabled={isDisabled}
            className="form-input border border-gray-300 rounded-md w-full p-2 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label
            className="block text-gray-700 font-bold mb-2 text-sm"
            htmlFor="startDate"
          >
            Primera Execució
          </label>
          <DatePicker
            id="startDate"
            selected={startDate}
            onChange={(date: Date) => onStartDateChange(date)}
            dateFormat="dd/MM/yyyy"
            locale={ca}
            disabled={isDisabled}
            className="border border-gray-300 p-2 rounded-md w-full disabled:bg-gray-100"
          />
        </div>

        {onTimeChange && (
          <div>
            <label
              className="block text-gray-700 font-bold mb-2 text-sm"
              htmlFor="timeExecution"
            >
              Temps d'execució
            </label>
            <OkronTimePicker
              selectedTime={
                timeExecution?.toLocaleTimeString('ca-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                }) || '00:00'
              }
              onTimeChange={onTimeChange}
              startTme={0}
              endTime={9}
              interval={30}
            />
          </div>
        )}

        {showLastExecution && lastExecution && (
          <div>
            <label className="block text-gray-700 font-bold mb-2 text-sm">
              Última Execució
            </label>
            <div className="p-2 bg-gray-50 rounded-md text-gray-700">
              {lastExecution}
            </div>
          </div>
        )}
      </div>
    </ContentCard>
  );
}
