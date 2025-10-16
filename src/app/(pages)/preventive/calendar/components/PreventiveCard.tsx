'use client';

import { Box, Typography } from '@mui/material';
import { useTranslations } from 'app/hooks/useTranslations';

import WorkOrderStatus from './WorkOrderStatus';

const styles = {
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
};

// Componente para mostrar cada preventive individual
const PreventiveCard = ({
  item,
  routes,
  onClick,
  size,
}: {
  item: any;
  routes: any;
  onClick?: () => void;
  onMouseLeave?: () => void;
  size?: 'small' | 'medium' | 'large';
}) => {
  const { t } = useTranslations();
  const hasWorkOrder = !!item.workOrder;

  const AssetBox = () => {
    const slice = size === 'small' ? 10 : size === 'medium' ? 15 : 20;
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
          {t('equipment')}:
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
          {item.preventive.asset.description.slice(0, slice) + '...'}
        </Typography>
      </Box>
    );
  };

  const slice = size === 'small' ? 7 : size === 'medium' ? 7 : 10;

  return (
    <Box sx={styles.preventiveCard(hasWorkOrder)}>
      <div onClick={() => onClick && onClick()}>
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
            {t('preventive')}:
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
            {item.preventive.description.slice(0, slice) + '...'}
          </Typography>
        </Box>
      </div>
      {/* Código de trabajo si existe */}
      {hasWorkOrder && (
        <WorkOrderStatus item={item.workOrder} routes={routes} />
      )}

      {/*  <Tooltip
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
      />*/}
    </Box>
  );
};

export default PreventiveCard;
