interface StatusConfig {
  names: Record<string, string>;
  colors: Record<string, string>;
}

export const entityStatusConfig: Record<string, StatusConfig> = {
  taskInstances: {
    names: {
      PENDING: 'Pendiente',
      CANCELLED: 'Cancelada',
      FINISHED: 'Finalizada',
    },
    colors: {
      PENDING: 'bg-hg-black500',
      CANCELLED: 'bg-hg-error',
      FINISHED: 'bg-hg-green',
    },
  },
  WORKORDER: {
    names: {
      Preventive: 'Preventiu',
      Corrective: 'Correctiu',
      Predictive: 'Predictiu',
    },
    colors: {
      '1': 'bg-okron-preventive',
      '0': 'bg-okron-corrective',
      '2': 'bg-okron-btDetail',
      '3': 'bg-okron-btDetail',
    },
  },
  WORKORDERSTATE: {
    names: {
      Preventive: 'En Curs',
      Corrective: 'En Espera',
      Predictive: 'Finalitzada',
    },
    colors: {
      '0': 'bg-okron-waiting',
      '1': 'bg-okron-onGoing',
      '2': 'bg-okron-paused',
      '3': 'bg-okron-finished',
      '4': 'bg-okron-finished',
      '5': 'bg-okron-pendingValidate',
      '6': 'bg-okron-btCreate',
      '7': 'bg-okron-finished',
      '8': 'bg-okron-paused',
    },
  },
  OPERATOR: {
    names: {
      Preventive: 'En Curs',
      Corrective: 'En Espera',
      Predictive: 'Finalitzada',
    },
    colors: {
      '0': 'bg-indigo-400',
      '1': 'bg-okron-finished',
      '2': 'bg-cyan-600',
      '3': 'bg-indigo-400',
      '4': 'bg-okron-finished',
    },
  },
  STOCKMOVEMENT: {
    names: {
      '0': 'Entrada',
      '1': 'Consum',
      '2': 'Transferència',
    },
    colors: {
      '0': 'bg-okron-preventive',
      '1': 'bg-okron-corrective',
      '2': 'bg-okron-btDetail',
    },
  },
  ORDER: {
    names: {
      '0': 'Pendent',
      '1': 'En Procés',
      '2': 'Completat',
      '3': 'Cancel·lat',
    },
    colors: {
      '0': 'bg-okron-waiting',
      '1': 'bg-okron-onGoing',
      '2': 'bg-okron-finished',
      '3': 'bg-okron-error',
    },
  },
  INVOICE: {
    names: {
      '0': 'Borrador',
      '1': 'Pendent',
      '2': 'Pagada',
      '3': "Cancel·lada",
      '4': "Vençuda"
    },
    colors: {
      '0': 'bg-okron-waiting',
      '1': 'bg-okron-onGoing',
      '2': 'bg-okron-finished',
      '3': 'bg-okron-finished',
      '4': 'bg-okron-pendingValidate'
    },
  },
  DELIVERYNOTE: {
    names: {
      '0': 'Borrador',
      '1': 'Enviat',
      '2': 'Pagat',
      '3': 'Vençut',
      '4': 'Cancel·lat'
    },
    colors: {
      '0': 'bg-okron-waiting',
      '1': 'bg-okron-onGoing',
      '2': 'bg-okron-finished',
      '3': 'bg-okron-pendingValidate',
      '4': 'bg-okron-error'
    },
  },
};
