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
    orders: {
      order: '/orders',
      orderPurchase: '/orders/orderForm?isPurchase=true',
      purchase: '/orders/purchases',
    },
    print: {
      workOrder: '/print/workorder',
      order: '/print/order',
    },
    accounts: '/account',
  };
};

export default useRoutes;
