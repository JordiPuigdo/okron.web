const useRoutes = () => {
  return {
    home: '/',
    menu: '/menu',
    customer: '/customer',
    preventive: {
      configuration: '/preventive',
      preventiveForm: '/preventive/preventiveForm',
      inspectionPoints: '/inspectionPoints',
    },
    corrective: '/corrective',
    workOrders: '/workOrders',
    spareParts: '/spareParts',
    configuration: {
      assets: '/assets',
      section: '/section',
      machines: '/machines',
      operators: '/operators',
      warehouse: '/wareHouse',
      provider: '/providers',
    },
    holidays: '/holidays',
    vacationApprovals: '/vacationApprovals',
    orders: {
      order: '/orders',
      orderPurchase: '/orders/orderForm?isPurchase=true',
      purchase: '/orders/purchases',
    },
    invoices: {
      list: '/invoices',
      create: '/invoices/create',
      detail: '/invoices/',
      edit: (id: string) => `/invoices/${id}/edit`,
    },
    budget: {
      list: '/invoices?tab=budgets',
      create: '/invoices?tab=budgets&create=true',
      detail: (id: string) => `/budgets/${id}`,
    },
    assemblyBudget: {
      list: '/assemblyBudgets',
      detail: (id: string) => `/assemblyBudgets/${id}`,
    },
    deliveryNote: {
      list: '/deliveryNotes',
      create: '/deliveryNotes/create',
      detail: (id: string) => `/deliveryNotes/${id}`,
      edit: (id: string) => `/deliveryNotes/${id}`,
    },
    print: {
      workOrder: '/print/workorder',
      order: '/print/order',
      budget: (id: string) => `/print/budget?id=${id}`,
    },
    accounts: '/account',
  };
};

export default useRoutes;
