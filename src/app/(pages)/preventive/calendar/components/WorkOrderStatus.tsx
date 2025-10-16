import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Tooltip } from '@mui/material';
import WorkOrder from 'app/interfaces/workOrder';
import Link from 'next/link';

import { getInspectionStatus } from './InspectionPointStatus';

const WorkOrderStatus = ({
  item,
  routes,
}: {
  item: WorkOrder;
  routes: any;
}) => {
  const inspectionPoints = item.workOrderInspectionPoint || [];
  const { Icon, color, label, counters } =
    getInspectionStatus(inspectionPoints);
  const tooltipText = `${label}
✔️ ${counters.passed} correctes | ❌ ${counters.failed} incorrectes | ⏳ ${counters.pending} pendents`;

  if (!item || !item.workOrderInspectionPoint) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        mt: 0.5,
        gap: 0.6,
      }}
    >
      {/* Icono de estado */}
      <Tooltip
        title={
          <Box sx={{ whiteSpace: 'pre-line', fontSize: '12px' }}>
            {tooltipText}
          </Box>
        }
        arrow
        placement="top"
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            mr: 0.6,
            cursor: 'default',
            transition: 'transform 0.2s ease',
            '&:hover': { transform: 'scale(1.1)' },
          }}
        >
          <Icon size={16} color={color} strokeWidth={2.2} />
        </Box>
      </Tooltip>
      {/* Enlace al Work Order */}
      <Link href={`${routes.workOrders}/${item?.id}`}>
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
          {item?.code}
        </Box>
      </Link>
    </Box>
  );
};

export default WorkOrderStatus;
