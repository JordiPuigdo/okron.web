// ----- BLOQUE A: IMPORTS + LÓGICA -----
import { WorkOrderInspectionPoint } from 'app/interfaces/workOrder';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  CheckCircle,
  CircleDashed,
  CircleOff,
  XCircle,
} from 'lucide-react';

type StatusInfo = {
  Icon: LucideIcon;
  color: string;
  label: string;
  counters: { passed: number; failed: number; pending: number; total: number };
};

export function getInspectionStatus(
  inspectionPoints: WorkOrderInspectionPoint[]
): StatusInfo {
  const points = inspectionPoints ?? [];
  const total = points.length;

  const passed = points.filter(p => p.check === true).length;
  const failed = points.filter(p => p.check === false).length;
  const pending = points.filter(p => p.check === null).length;

  const allTrue = total > 0 && passed === total;
  const allFalse = total > 0 && failed === total;
  const allNull = total > 0 && pending === total;
  const allChecked = total > 0 && pending === 0;
  const mixedTrueFalse = allChecked && passed > 0 && failed > 0;
  const someNull = pending > 0 && pending < total;

  // --- Estados ---
  // ✅ OK → allTrue
  // ❌ NOK → allFalse
  // ⚠️ Problemas → todos revisados, mezcla de true/false
  // 🟡 Parcial → hay null y mezcla
  // 🔴 Sin hacer → todos null

  if (allTrue) {
    return {
      Icon: CheckCircle,
      color: '#34a853',
      label: 'OK',
      counters: { passed, failed, pending, total },
    };
  }

  if (allFalse) {
    return {
      Icon: XCircle,
      color: '#ea4335',
      label: 'NOK',
      counters: { passed, failed, pending, total },
    };
  }

  if (allNull) {
    return {
      Icon: CircleOff,
      color: '#ea4335',
      label: 'No iniciat',
      counters: { passed, failed, pending, total },
    };
  }

  if (mixedTrueFalse) {
    return {
      Icon: AlertTriangle,
      color: '#fabc05',
      label: 'Problemes detectats',
      counters: { passed, failed, pending, total },
    };
  }

  if (someNull) {
    return {
      Icon: CircleDashed,
      color: '#fabc05',
      label: 'Pendent Parcialment',
      counters: { passed, failed, pending, total },
    };
  }

  // Estado por defecto (defensivo)
  return {
    Icon: CircleDashed,
    color: '#5f6368',
    label: 'Estado desconocido',
    counters: { passed, failed, pending, total },
  };
}
