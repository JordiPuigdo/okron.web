import { Tooltip as ReactTooltip } from 'react-tooltip';

interface WorkOrderOperationsInTableToolTipsProps {
  pause: boolean;
}

export default function WorkOrderOperationsInTableToolTips({
  pause,
}: WorkOrderOperationsInTableToolTipsProps) {
  return (
    <>
      <ReactTooltip
        id="my-tooltip-1"
        place="bottom"
        variant="info"
        content={`${pause ? 'En Curs' : 'Pausar'} `}
        delayShow={500}
      />
      <ReactTooltip
        id="my-tooltip-2"
        place="bottom"
        variant="info"
        content="En Curs"
        delayShow={500}
      />
      <ReactTooltip
        id="my-tooltip-3"
        place="bottom"
        variant="info"
        content="Mostrar recanvis"
        delayShow={500}
      />
      <ReactTooltip
        id="edit"
        place="bottom"
        variant="info"
        content="Editar"
        delayShow={500}
      />
      <ReactTooltip
        id="InspectionPoints"
        place="bottom"
        variant="info"
        content="OK Punts Inspecció"
        delayShow={500}
      />
    </>
  );
}
