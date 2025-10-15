interface StatusConfig {
  names: Record<string, string>;
  colors: Record<string, string>;
}

// Function to get entity status config with translations
export const getEntityStatusConfig = (
  t: (key: string) => string
): Record<string, StatusConfig> => ({
  taskInstances: {
    names: {
      PENDING: t('entity.status.pending'),
      CANCELLED: t('entity.status.cancelled'),
      FINISHED: t('entity.status.finished'),
    },
    colors: {
      PENDING: 'bg-hg-black500',
      CANCELLED: 'bg-hg-error',
      FINISHED: 'bg-hg-green',
    },
  },
  WORKORDER: {
    names: {
      Preventive: t('entity.status.preventive'),
      Corrective: t('entity.status.corrective'),
      Predictive: t('entity.status.predictive'),
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
      Preventive: t('entity.status.ongoing'),
      Corrective: t('entity.status.waiting'),
      Predictive: t('entity.status.finished'),
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
      '9': 'bg-okron-invoiced',
    },
  },
  OPERATOR: {
    names: {
      Preventive: t('entity.status.ongoing'),
      Corrective: t('entity.status.waiting'),
      Predictive: t('entity.status.finished'),
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
      '0': t('entity.status.entry'),
      '1': t('entity.status.consumption'),
      '2': t('entity.status.transfer'),
    },
    colors: {
      '0': 'bg-okron-preventive',
      '1': 'bg-okron-corrective',
      '2': 'bg-okron-btDetail',
    },
  },
  ORDER: {
    names: {
      '0': t('entity.status.pending'),
      '1': t('entity.status.in.process'),
      '2': t('entity.status.completed'),
      '3': t('entity.status.cancelled'),
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
      '0': t('entity.status.draft'),
      '1': t('entity.status.pending'),
      '2': t('entity.status.paid'),
      '3': t('entity.status.cancelled'),
      '4': t('entity.status.overdue'),
    },
    colors: {
      '0': 'bg-okron-waiting',
      '1': 'bg-okron-onGoing',
      '2': 'bg-okron-finished',
      '3': 'bg-okron-finished',
      '4': 'bg-okron-pendingValidate',
    },
  },
  DELIVERYNOTE: {
    names: {
      '0': t('entity.status.draft'),
      '1': t('entity.status.sent'),
      '2': t('entity.status.paid.deliverynote'),
      '3': t('entity.status.overdue.deliverynote'),
      '4': t('entity.status.cancelled'),
    },
    colors: {
      '0': 'bg-okron-waiting',
      '1': 'bg-okron-onGoing',
      '2': 'bg-okron-finished',
      '3': 'bg-okron-pendingValidate',
      '4': 'bg-okron-error',
    },
  },
});

// Note: entityStatusConfig has been removed. Use getEntityStatusConfig(t) instead.
