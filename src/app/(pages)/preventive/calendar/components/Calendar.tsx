'use client';
import 'dayjs/locale/ca';

import React, { useState } from 'react';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import { useAssetHook } from 'app/hooks/useAssetHook';
import { usePreventiveSchedule } from 'app/hooks/usePreventives';
import { DailyPreventives } from 'app/interfaces/Preventive';
import useRoutes from 'app/utils/useRoutes';
import { FilterType } from 'components/table/components/Filters/FilterType';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import Link from 'next/link';

dayjs.extend(isoWeek);
dayjs.locale('ca');

export default function PreventiveCalendar() {
  // Estado para el mes actual
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  // Calculamos el rango del mes actual
  const startDate = currentMonth.startOf('month').toDate();
  const routes = useRoutes();
  const [filters, setFilters] = useState<{ [key: string]: any[] }>({
    status: [],
  });

  const { assets } = useAssetHook();

  // Formateamos las fechas para enviarlas al hook
  const formattedStart = currentMonth
    .startOf('month')
    .startOf('isoWeek')
    .format('YYYY-MM-DD');
  const formattedEnd = currentMonth
    .endOf('month')
    .endOf('isoWeek')
    .format('YYYY-MM-DD');

  const { schedule, loading, error } = usePreventiveSchedule(
    formattedStart,
    formattedEnd
  );

  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>(
    {}
  );

  function getWeeksOfMonth(year: number, month: number) {
    const start = dayjs()
      .year(year)
      .month(month)
      .startOf('month')
      .startOf('isoWeek');
    const end = dayjs().year(year).month(month).endOf('month').endOf('isoWeek');

    const weeks: Date[][] = [];
    let current = start;

    while (current.isBefore(end)) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(current.toDate());
        current = current.add(1, 'day');
      }
      weeks.push(week);
    }
    return weeks;
  }

  const monthIndex = dayjs(startDate).month();
  const yearValue = dayjs(startDate).year();
  const weeks = getWeeksOfMonth(yearValue, monthIndex);

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => prev.subtract(1, 'month'));
    setExpandedDays({});
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => prev.add(1, 'month'));
    setExpandedDays({});
  };

  const getFilteredDailyPreventives = (): DailyPreventives[] => {
    if (!schedule) return [];
    if (!filters.asset || filters.asset.length === 0) return schedule;

    return schedule.reduce((acc: DailyPreventives[], day) => {
      const preventiveMatch = day.preventives?.find(op =>
        filters.asset.includes(op.preventive.asset.id)
      );
      if (preventiveMatch) {
        acc.push({ ...day, preventives: [preventiveMatch] });
      }
      return acc;
    }, []);
  };

  const filteredSchedule = getFilteredDailyPreventives();

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Calendar Preventius
      </Typography>

      <div className="p-2 bg-white rounded-md shadow-md mb-4">
        <div className="flex gap-6 p-2">
          <div className="flex w-full">
            <FilterType<string>
              filters={filters}
              setFilters={setFilters}
              validTypes={assets?.map(asset => asset.id) || []}
              filterKey="asset"
              placeholder="Equip"
              translateFn={(id: string) => {
                const asset = assets?.find(c => c.id === id);
                return asset
                  ? `${asset.code} - ${asset.description} - ${asset.brand}`
                  : id;
              }}
            />
          </div>
        </div>
        <div>
          <Box
            mb={2}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <IconButton onClick={goToPreviousMonth}>
              <KeyboardArrowLeftIcon />
            </IconButton>
            <Typography variant="h6">
              {currentMonth.format('MMMM YYYY')}
            </Typography>
            <IconButton onClick={goToNextMonth}>
              <KeyboardArrowRightIcon />
            </IconButton>
          </Box>
        </div>
      </div>

      {loading && <CircularProgress sx={{ mt: 3 }} />}
      {error && (
        <Typography color="error" mt={2}>
          {error}
        </Typography>
      )}

      {filteredSchedule && (
        <Box mt={3}>
          {weeks.map((week, weekIndex) => (
            <Box
              key={weekIndex}
              display="flex"
              gap={2}
              mb={2}
              sx={{
                backgroundColor: weekIndex % 2 === 1 ? '#f7f7f7' : '#ffffff',
                borderRadius: 2,
                p: 1,
              }}
            >
              {week.map((day, dayIndex) => {
                const key = dayjs(day).format('YYYY-MM-DD');
                const isExpanded = expandedDays[key] || false;

                const toggleExpanded = () => {
                  setExpandedDays(prev => ({
                    ...prev,
                    [key]: !prev[key],
                  }));
                };

                const dayData = filteredSchedule.find(d =>
                  dayjs(d.date).isSame(day, 'day')
                );
                const label = dayjs(day).format('dddd, D MMMM');

                const preventivesForDay = dayData?.preventives || [];
                const visibleItems = isExpanded
                  ? preventivesForDay
                  : preventivesForDay.slice(0, 2);

                return (
                  <Paper
                    key={dayIndex}
                    sx={{
                      p: 1,
                      minWidth: 170,
                      maxWidth: '100%',
                      height: isExpanded ? 'auto' : 260,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: '#ffffff',
                      position: 'relative',
                      flex: '1 1 200px',
                    }}
                    elevation={2}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      {label}
                    </Typography>

                    {visibleItems.length > 0 ? (
                      visibleItems.map((item, i) => (
                        <Box
                          key={i}
                          sx={{
                            backgroundColor: item.workOrder
                              ? '#d0f0c0'
                              : '#fff3cd',
                            p: 1,
                            mt: 1,
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="caption" fontSize={12}>
                            {item.preventive.code}
                          </Typography>
                          <br />
                          <Typography variant="caption" fontSize={12}>
                            {item.preventive.description.length >= 30
                              ? `${item.preventive.description.slice(0, 29)}...`
                              : item.preventive.description}
                          </Typography>
                          <br />
                          <div className={`${item.workOrder ? '' : 'mt-2'}`}>
                            <Typography variant="caption" fontSize={11}>
                              <Link
                                href={`${routes.workOrders}/${item.workOrder?.id}`}
                                className="hover:underline hover:text-blue-600"
                              >
                                {item.workOrder?.code}
                              </Link>
                            </Typography>
                          </div>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        –
                      </Typography>
                    )}

                    {preventivesForDay.length > 2 && (
                      <Box mt={1}>
                        <Typography
                          variant="caption"
                          sx={{ cursor: 'pointer', color: 'primary.main' }}
                          onClick={toggleExpanded}
                        >
                          {isExpanded
                            ? 'Mostrar menys'
                            : `+${preventivesForDay.length - 2} més`}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                );
              })}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
