'use client';
import 'dayjs/locale/ca';

import React, { useMemo, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
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
import Link from 'next/link';

dayjs.extend(isoWeek);
dayjs.locale('ca');

// Estilos consistentes para las tarjetas
// Estilos consistentes para las tarjetas
const cardStyles = {
  preventiveCard: (hasWorkOrder: boolean) => ({
    backgroundColor: hasWorkOrder ? '#e6f4ea' : '#fef7cd',
    p: 1,
    borderRadius: '6px',
    borderLeft: `3px solid ${hasWorkOrder ? '#34a853' : '#fabc05'}`,
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
    },
    cursor: 'pointer',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    width: '100%',
  }),
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

// Componente para mostrar cada preventive individual
const PreventiveCard = ({ item, routes }: { item: any; routes: any }) => {
  const hasWorkOrder = !!item.workOrder;
  const tooltipId = `preventive-tooltip-${item.preventive.id}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  const AssetBox = () => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}>
        <Typography
          variant="caption"
          sx={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#5f6368',
            flexShrink: 0,
            minWidth: '42px',
          }}
        >
          Equip:
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: '11px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            color: '#202124',
          }}
        >
          {item.preventive.asset.description.slice(0, 10) + '...'}
        </Typography>
      </Box>
    );
  };

  return (
    <Box
      data-tooltip-id={tooltipId}
      data-tooltip-content={`${item.preventive.asset.description} -> ${item.preventive.description}`}
      sx={cardStyles.preventiveCard(hasWorkOrder)}
    >
      {/* Información del equipo */}
      <AssetBox />

      {/* Código del preventivo */}
      {/* Información del preventivo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          mb: hasWorkOrder ? 0.5 : 0,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#5f6368',
            flexShrink: 0,
            minWidth: '42px',
            lineHeight: 1.3,
          }}
        >
          Preventiu:
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: '11px',
            fontWeight: 500,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            flex: 1,
            color: '#202124',
            maxHeight: '2.6em',
          }}
        >
          {item.preventive.description.slice(0, 10) + '...'}
        </Typography>
      </Box>

      {/* Código de trabajo si existe */}
      {hasWorkOrder && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
          <Link
            href={`${routes.workOrders}/${item.workOrder?.id}`}
            passHref
            legacyBehavior
          >
            <Box
              component="a"
              onClick={e => e.stopPropagation()}
              sx={{
                fontSize: '10px',
                color: '#1a73e8',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(26, 115, 232, 0.08)',
                '&:hover': {
                  color: '#174ea6',
                  backgroundColor: 'rgba(26, 115, 232, 0.12)',
                },
              }}
            >
              <OpenInNewIcon sx={{ fontSize: '11px', mr: 0.3 }} />
              {item.workOrder?.code}
            </Box>
          </Link>
        </Box>
      )}

      <Tooltip
        id={tooltipId}
        place="top"
        delayShow={300}
        style={{
          backgroundColor: '#2d2d2d',
          color: 'white',
          fontSize: '12px',
          padding: '10px 14px',
          borderRadius: '8px',
          maxWidth: '320px',
          zIndex: 9999,
          lineHeight: '1.5',
          whiteSpace: 'pre-line',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontWeight: '400',
        }}
        arrowColor="#2d2d2d"
      />
    </Box>
  );
};

export default function PreventiveCalendar() {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [filters, setFilters] = useState<{ [key: string]: any[] }>({
    status: [],
  });

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
                        height: '100%', // 🔥 se adapta a la altura del row
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
    </Box>
  );
}
