'use client';
import 'dayjs/locale/ca';

import React, { useMemo, useRef, useState } from 'react';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useAssetHook } from 'app/hooks/useAssetHook';
import { usePreventiveSchedule } from 'app/hooks/usePreventives';
import { DailyPreventives } from 'app/interfaces/Preventive';
import useRoutes from 'app/utils/useRoutes';
import { FilterType } from 'components/table/components/Filters/FilterType';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

import PreventiveCard from './PreventiveCard';
import PreventiveDetailModal from './PreventiveDetailModal';

dayjs.extend(isoWeek);
dayjs.locale('ca');

const cardStyles = {
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)', // 7 columnas fijas
    gap: 1.5,
    p: 1,
  },
  dayPaper: {
    p: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    height: '250px', // 🔥 altura fija de cada cajita
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    transition: 'box-shadow 0.2s ease',
    '&:hover': {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
  },
  dayHeader: {
    fontWeight: 'bold',
    mb: 0.5,
    fontSize: '13px',
    borderBottom: '1px solid',
    borderColor: 'divider',
    pb: 0.5,
    flexShrink: 0,
  },
  preventivesWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 1,
    overflow: 'hidden', // 🔥 evita que crezca
  },
  seeMore: {
    mt: 'auto',
    pt: 0.5,
    textAlign: 'center',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    color: 'primary.main',
    '&:hover': { textDecoration: 'underline' },
  },
};

export default function PreventiveCalendar() {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>(
    {}
  );
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [filters, setFilters] = useState<{ [key: string]: any[] }>({
    status: [],
  });
  const [selectedPreventive, setSelectedPreventive] = useState<any | null>(
    null
  );

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  const routes = useRoutes();
  const { assets } = useAssetHook();

  const startDate = currentMonth.startOf('month').toDate();
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

  const getDayPaperHeight = () => {
    if (isSmallScreen) return '100%';
    return '100%';
  };

  // Memorizar cálculo de semanas
  const weeks = useMemo(() => {
    const monthIndex = dayjs(startDate).month();
    const yearValue = dayjs(startDate).year();

    const start = dayjs()
      .year(yearValue)
      .month(monthIndex)
      .startOf('month')
      .startOf('isoWeek');
    const end = dayjs()
      .year(yearValue)
      .month(monthIndex)
      .endOf('month')
      .endOf('isoWeek');

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
  }, [startDate]);

  // Memorizar filteredSchedule
  const filteredSchedule = useMemo(() => {
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
  }, [schedule, filters.asset]);

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => prev.subtract(1, 'month'));
    setExpandedDays({});
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => prev.add(1, 'month'));
    setExpandedDays({});
  };

  const toggleExpanded = (key: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Box p={3}>
      {/* Header con filtros y navegación */}
      <Paper
        elevation={0}
        sx={{ p: 2, borderRadius: 2, mb: 3, bgcolor: 'background.default' }}
      >
        <Box
          sx={{
            gap: 2,

            mb: 2,
          }}
        >
          <FilterType<string>
            filters={filters}
            setFilters={setFilters}
            validTypes={assets?.map(asset => asset.id) || []}
            filterKey="asset"
            placeholder="Filtrar per equip"
            translateFn={(id: string) => {
              const asset = assets?.find(c => c.id === id);
              return asset ? `${asset.code} - ${asset.description}` : id;
            }}
          />
          <div>
            <Box className="flex justify-between items-center pt-4 mb-4">
              <IconButton
                onClick={goToPreviousMonth}
                size="small"
                sx={{ color: 'text.primary' }}
              >
                <KeyboardArrowLeftIcon />
              </IconButton>

              <Typography
                variant="h6"
                sx={{ mx: 2, minWidth: 180, textAlign: 'center' }}
              >
                {currentMonth.format('MMMM YYYY')}
              </Typography>

              <IconButton
                onClick={goToNextMonth}
                size="small"
                sx={{ color: 'text.primary' }}
              >
                <KeyboardArrowRightIcon />
              </IconButton>
            </Box>
          </div>
        </Box>
      </Paper>

      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" textAlign="center" mt={2}>
          {error}
        </Typography>
      )}

      {/* Calendario */}
      {!loading && !error && filteredSchedule && (
        <Box>
          {/* Días de la semana */}
          <Box
            sx={{
              ...cardStyles.calendarGrid,
              mb: 1,
            }}
          >
            {['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'].map((day, index) => (
              <Box key={index} textAlign="center" py={1}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  color="text.secondary"
                >
                  {day}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Semanas */}
          {weeks.map((week, weekIndex) => {
            // 1️⃣ Calcular cuántos preventivos se muestran por día
            const preventivesPerDay = week.map(day => {
              const key = dayjs(day).format('YYYY-MM-DD');
              const dayData = filteredSchedule.find(d =>
                dayjs(d.date).isSame(day, 'day')
              );
              const isExpanded = expandedDays[key] || false;
              const preventivesForDay = dayData?.preventives || [];
              return isExpanded ? preventivesForDay.length : 2; // 2 visibles por defecto
            });

            // 2️⃣ Calcular altura máxima de la fila
            const maxItems = Math.max(...preventivesPerDay, 0);
            const baseHeight = isSmallScreen ? 300 : 250;

            const rowHeight = maxItems > 2 ? maxItems - 2 * 125 : baseHeight;

            return (
              <Box
                key={weekIndex}
                sx={{
                  ...cardStyles.calendarGrid,
                  height: `${rowHeight}px`, // 🔥 altura dinámica por fila
                }}
              >
                {week.map((day, dayIndex) => {
                  const key = dayjs(day).format('YYYY-MM-DD');
                  const isExpanded = expandedDays[key] || false;
                  const dayData = filteredSchedule.find(d =>
                    dayjs(d.date).isSame(day, 'day')
                  );
                  const hasWorkOrders = dayData?.preventives?.some(
                    p => p.workOrder
                  );
                  const preventivesForDay = dayData?.preventives || [];

                  const maxShowMore = hasWorkOrders ? 2 : 3; // Máximo de preventivos visibles sin expandir

                  const visibleItems = isExpanded
                    ? preventivesForDay
                    : [...preventivesForDay] // copiamos para no mutar el array original
                        .sort((a, b) => {
                          if (a.workOrder && !b.workOrder) return -1; // a primero
                          if (!a.workOrder && b.workOrder) return 1; // b primero
                          return 0; // si los dos son iguales se mantiene el orden
                        })
                        .slice(0, hasWorkOrders ? 2 : 3);

                  const isCurrentMonth = dayjs(day).isSame(
                    currentMonth,
                    'month'
                  );

                  return (
                    <Paper
                      key={dayIndex}
                      sx={{
                        ...cardStyles.dayPaper,
                        height: getDayPaperHeight(), // 🔥 Altura responsiva
                        opacity: isCurrentMonth ? 1 : 0.5,
                        bgcolor: isCurrentMonth
                          ? 'background.paper'
                          : 'grey.50',
                      }}
                    >
                      {/* Header del día */}
                      <Typography
                        sx={{
                          ...cardStyles.dayHeader,
                          color: isCurrentMonth
                            ? 'text.primary'
                            : 'text.secondary',
                        }}
                      >
                        {dayjs(day).format('D')}
                      </Typography>

                      {/* Preventivos del día */}
                      <Box sx={cardStyles.preventivesWrapper}>
                        {visibleItems.length > 0 ? (
                          visibleItems.map((item, i) => (
                            <PreventiveCard
                              key={i}
                              item={item}
                              routes={routes}
                              onClick={() => setSelectedPreventive(item)}
                              size={
                                isSmallScreen
                                  ? 'small'
                                  : isMediumScreen
                                  ? 'medium'
                                  : 'large'
                              }
                            />
                          ))
                        ) : (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ textAlign: 'center', mt: 1 }}
                          >
                            No hi ha preventius
                          </Typography>
                        )}
                      </Box>

                      {/* Botón para expandir/colapsar */}
                      {preventivesForDay.length > maxShowMore && (
                        <Typography
                          sx={cardStyles.seeMore}
                          onClick={() => toggleExpanded(key)}
                        >
                          {isExpanded
                            ? 'Mostrar menys'
                            : `+${preventivesForDay.length - maxShowMore} més`}
                        </Typography>
                      )}
                    </Paper>
                  );
                })}
              </Box>
            );
          })}
        </Box>
      )}
      <PreventiveDetailModal
        open={selectedPreventive != null}
        onClose={() => setSelectedPreventive(null)}
        preventive={selectedPreventive}
      />
    </Box>
  );
}
