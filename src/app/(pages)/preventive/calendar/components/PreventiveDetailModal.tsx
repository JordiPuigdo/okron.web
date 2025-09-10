import React from 'react';
import { Close } from '@mui/icons-material';
import {
  Box,
  Chip,
  Divider,
  IconButton,
  Modal,
  Typography,
} from '@mui/material';
import { DailyPreventivesAndOperations } from 'app/interfaces/Preventive';
import dayjs from 'dayjs';

import { WorkOrderPerPreventive } from '../../[id]/components/WorkOrderPerPreventive';

// Estilos para el modal
const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: '80%', md: '1200px' },
  maxHeight: '85vh',
  bgcolor: 'background.paper',
  borderRadius: '12px',
  boxShadow: 24,
  overflow: 'auto',
  p: 3,
};

// Componente Modal de Detalles
const PreventiveDetailModal = ({
  open,
  onClose,
  preventive,
}: {
  open: boolean;
  onClose: () => void;
  preventive: DailyPreventivesAndOperations | null;
}) => {
  if (!preventive) return null;

  const adjustToWorkingDay = (date: dayjs.Dayjs) => {
    let adjustedDate = date;
    // 0 es domingo, 6 es sábado
    while (adjustedDate.day() === 0 || adjustedDate.day() === 6) {
      adjustedDate = adjustedDate.add(1, 'day');
    }
    return adjustedDate;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="preventive-detail-modal"
      aria-describedby="detailed-information-about-preventive"
    >
      <Box sx={modalStyle}>
        {/* Header del modal */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Typography
            id="modal-title"
            variant="h6"
            component="h2"
            sx={{ fontWeight: 600 }}
          >
            Detalls del preventiu
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: 'text.secondary' }}
            aria-label="tancar modal"
          >
            <Close />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Contenido del modal */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
          }}
        >
          {/* Columna izquierda - Información principal */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}
            >
              Informació del Preventiu
            </Typography>

            {/* Información del equipo */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
              >
                Equip
              </Typography>
              <Typography variant="body1">
                {preventive.preventive.asset.description}
              </Typography>
              <Chip
                label={preventive.preventive.asset.code}
                size="small"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>

            {/* Información del preventivo */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
              >
                Preventiu
              </Typography>
              <Typography variant="body1">
                {preventive.preventive.description}
              </Typography>
            </Box>

            {/* Frecuencia */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
              >
                Freqüència
              </Typography>
              <Typography variant="body1">
                Cada {preventive.preventive.days} dies
              </Typography>
            </Box>

            {/* Última ejecución */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
              >
                Última execució
              </Typography>
              <Typography variant="body1">
                {dayjs(preventive.preventive.lastExecution).format(
                  'DD/MM/YYYY'
                )}
              </Typography>
            </Box>

            {/* Próxima ejecución */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
              >
                Pròxima execució
              </Typography>
              <Typography variant="body1">
                {preventive.preventive.lastExecution
                  ? adjustToWorkingDay(
                      dayjs(preventive.preventive.lastExecution).add(
                        preventive.preventive.days,
                        'day'
                      )
                    ).format('DD/MM/YYYY')
                  : 'No programada'}
              </Typography>
            </Box>
          </Box>

          {/* Separador vertical */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: 'none', md: 'block' } }}
          />

          {/* Columna derecha - Puntos de inspección y operarios */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}
            >
              Operaris i Punts d'Inspecció
            </Typography>

            {/* Operarios asignados */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}
              >
                Operaris Assignats
              </Typography>
              {preventive.preventive.operators &&
              preventive.preventive.operators.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {preventive.preventive.operators.map((worker, index) => (
                    <Chip
                      key={index}
                      label={worker.name || 'Operari no assignat'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hi ha operaris assignats
                </Typography>
              )}
            </Box>

            {/* Puntos de inspección */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}
              >
                Punts d'Inspecció
              </Typography>
              {preventive.preventive.inspectionPoints &&
              preventive.preventive.inspectionPoints.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {preventive.preventive.inspectionPoints.map(
                    (inspectionPoint, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: 'grey.50',
                          border: '1px solid',
                          borderColor: 'grey.200',
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {inspectionPoint.description}
                        </Typography>
                      </Box>
                    )
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hi ha punts d'inspecció definits
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}
            >
              Històric Ordres de treball
            </Typography>
            <WorkOrderPerPreventive
              id={preventive.preventive.id}
              className="overflow-auto max-h-80"
            />
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default PreventiveDetailModal;
