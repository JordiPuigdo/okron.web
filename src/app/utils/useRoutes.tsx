const useRoutes = () => {
  return {
    home: '/',
    menu: '/menu',

    preventive: {
      configuration: '/preventive',
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
    orders: '/orders',
  };
};

export default useRoutes;
