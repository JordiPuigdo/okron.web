'use client';

import 'react-time-picker/dist/TimePicker.css';

import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import TimePicker from 'react-time-picker';
import { Combobox } from '@headlessui/react';
import { Checkbox, Input, ListItemText, MenuItem, Select } from '@mui/material';
import { SvgArrowDown } from 'app/icons/icons';
import { DayOfWeek, Rate, RateType } from 'app/interfaces/Rate';
import { formatTime } from 'app/utils/utils';
import TimePickerWrapper from 'components/timepicker/TimePickerWrapper';
import { Button } from 'designSystem/Button/Buttons';
import { CheckIcon } from 'lucide-react';

interface Props {
  rateTypes: RateType[];
  onSubmit: (data: Omit<Rate, 'id'>) => Promise<void>;
  isSubmit?: boolean;
}

const dayOfWeekOptions = [
  { value: DayOfWeek.Monday, label: 'Dilluns' },
  { value: DayOfWeek.Tuesday, label: 'Dimarts' },
  { value: DayOfWeek.Wednesday, label: 'Dimecres' },
  { value: DayOfWeek.Thursday, label: 'Dijous' },
  { value: DayOfWeek.Friday, label: 'Divendres' },
  { value: DayOfWeek.Saturday, label: 'Dissabte' },
  { value: DayOfWeek.Sunday, label: 'Diumenge' },
];

export function RateForm({ rateTypes, onSubmit, isSubmit = true }: Props) {
  const { control, register, handleSubmit, reset, getValues } =
    useForm<Omit<Rate, 'id'>>();
  const [query, setQuery] = useState('');
  const [selectedRateType, setSelectedRateType] = useState<RateType | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const filteredRateTypes = useMemo(
    () =>
      query === ''
        ? rateTypes
        : rateTypes.filter(
            rt =>
              rt.code.toLowerCase().includes(query.toLowerCase()) ||
              rt.description?.toLowerCase().includes(query.toLowerCase())
          ),
    [query, rateTypes]
  );

  const getRateTypeDisplay = (rt: RateType) =>
    rt ? `${rt.code} - ${rt.description ?? ''}` : '';

  const submit = async (data: Omit<Rate, 'id'>) => {
    if (!selectedRateType) return;
    setLoading(true);
    try {
      await onSubmit({
        ...data,
        startTime: formatTime(data.startTime),
        endTime: formatTime(data.endTime),
        rateTypeId: selectedRateType.id,
      });
      reset();
      setSelectedRateType(null);
      setQuery('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4 p-6 ">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipus de tarifa *
          </label>
          <Combobox value={selectedRateType} onChange={setSelectedRateType}>
            <div className="relative">
              <Combobox.Input
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={e => setQuery(e.target.value)}
                displayValue={getRateTypeDisplay}
                placeholder="Ex: FESTIU"
              />
              <Combobox.Button className="absolute inset-y-0 right-2 flex items-center">
                <SvgArrowDown />
              </Combobox.Button>
              {filteredRateTypes.length > 0 && (
                <Combobox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 overflow-auto rounded-md border border-gray-200">
                  {filteredRateTypes.map(rt => (
                    <Combobox.Option
                      key={rt.id}
                      value={rt}
                      className={({ active }) =>
                        `cursor-pointer select-none p-2 ${
                          active ? 'bg-blue-100' : ''
                        }`
                      }
                    >
                      {({ selected }) => (
                        <span className="flex justify-between items-center">
                          <span>{rt.code}</span>
                          <span className="text-sm text-gray-500 ml-2 truncate">
                            {rt.description}
                          </span>
                          {selected && (
                            <CheckIcon className="w-4 h-4 text-green-500 ml-2" />
                          )}
                        </span>
                      )}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              )}
            </div>
          </Combobox>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preu *
          </label>
          <Input
            type="number"
            {...register('price', { required: true, min: 0 })}
            inputProps={{ step: 0.01 }}
            fullWidth
            placeholder="Ex: 12.50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dies de la setmana *
          </label>
          <Controller
            name="daysOfWeek"
            control={control}
            defaultValue={[]}
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                multiple
                value={field.value}
                onChange={e => field.onChange(e.target.value)}
                renderValue={selected =>
                  (selected as DayOfWeek[])
                    .map(
                      v =>
                        dayOfWeekOptions.find(opt => opt.value === v)?.label ??
                        v
                    )
                    .join(', ')
                }
                fullWidth
              >
                {dayOfWeekOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Checkbox checked={field.value.includes(option.value)} />
                    <ListItemText primary={option.label} />
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </div>

        <div className="flex gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora d'inici *
            </label>
            <Controller
              name="startTime"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TimePickerWrapper
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora de fi
            </label>
            <Controller
              name="endTime"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TimePicker
                  {...field}
                  disableClock
                  format="HH:mm"
                  locale="ca-ES"
                  clearIcon={null}
                />
              )}
            />
          </div>
        </div>
      </div>

      <Button
        type="create"
        isSubmit={isSubmit}
        disabled={loading}
        className="mt-4 w-full md:w-auto text-white"
        onClick={
          !isSubmit
            ? async () => {
                const defaultData = getValues();
                await submit(defaultData);
              }
            : undefined
        }
      >
        {loading ? 'Creant...' : 'Crear Tarifa'}
      </Button>
    </form>
  );
}
