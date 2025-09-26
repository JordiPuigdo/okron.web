import { useEffect, useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import Machine from 'app/interfaces/machine';
import WorkOrder, {
  AddWorkOrderOperatorTimes,
  FinishWorkOrderOperatorTimes,
  StateWorkOrder,
} from 'app/interfaces/workOrder';
import MachineService from 'app/services/machineService';
import { workOrderService } from 'app/services/workOrderService';
import MainLayout from 'components/layout/MainLayout';
import { useRouter } from 'next/router';

const MachineDetailsPage = () => {
  const { t } = useTranslations();
  const router = useRouter();
  const { id } = router.query;
  const [machine, setMachine] = useState<Machine | null>();
  const [WorkOrder, setWorkOrder] = useState<WorkOrder[] | []>([]);
  const machineService = new MachineService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<
    string | null
  >();
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(
    null
  );
  const [showPreventive, setShowPreventive] = useState(false);

  useEffect(() => {
    if (id) {
      machineService.getMachineById(id as string).then(data => {
        setMachine(data);
      });
      workOrderService.getWorkOrdersByMachine(id as string).then(data => {
        setWorkOrder(data);
      });
    }
  }, [id]);

  const toggleVisibility = (section: string) => {
    switch (section) {
      case 'Preventive':
        setShowPreventive(!showPreventive);
        setSelectedWorkOrderId(null);
        break;
      default:
        break;
    }
  };

  const startWorkOrder = async (id: string) => {
    //TODO Fitxar Operari
    const addWorkOrderOperatorTimes: AddWorkOrderOperatorTimes = {
      WorkOrderId: id,
      operatorId: '652fdb692614987920656210',
      startTime: new Date(),
    };
    await workOrderService.addWorkOrderOperatorTimes(addWorkOrderOperatorTimes);
  };

  const finishWorkOrder = async (id: string) => {
    //TODO Fitxar Operari
    const finishWorkOrderOperatorTimes: FinishWorkOrderOperatorTimes = {
      WorkOrderId: id,
      operatorId: '652fdb692614987920656210',
      finishTime: new Date(),
    };
    await workOrderService.finishWorkOrderOperatorTimes(
      finishWorkOrderOperatorTimes
    );
  };

  if (!machine) {
    return <p>{t('loading.machine.detail')}</p>;
  }

  return (
    <MainLayout>
      <div className="bg-white p-6 rounded-lg shadow-md flex">
        <div className="flex-none w-1/3 mr-6">
          <img
            src="https://i.machineryhost.com/3a8853b9d4992f13ae173de7ac6abed4/large-used-maszyna-pakujaca-prozniowa-w-ruchu-ciaglym-multivac-m-855-f-pc.jpg"
            alt={machine.description}
          />
        </div>
        <div className="flex-grow mr-6">
          <h2 className="text-2xl font-semibold mb-4">{machine.description}</h2>
          <p className="text-gray-600 mb-8">{t('company')}: {machine.company}</p>
          <p className="text-gray-600 mb-8">{t('section')}: {machine.section}</p>
          <p className="text-gray-600 mb-8">
            {t('serial.number')}: {machine.serialNumber}
          </p>
          <p className="text-gray-600 mb-8">{t('year')}: {machine.year}</p>
        </div>

        <div className="flex-grow mr-6">
          {showPreventive && WorkOrder && (
            <div className="gap-4">
              {WorkOrder.map(op => (
                <div
                  key={op.id}
                  className="bg-blue-100 p-4 rounded-lg shadow-md mb-4"
                  onClick={() => {
                    setSelectedWorkOrderId(op.id);
                    setSelectedWorkOrder(op);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <h4 className="text-lg font-semibold mb-2">
                    {op.description}
                  </h4>
                  <p className="text-gray-600 mb-2">{t('state')}:</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-grow">
          {selectedWorkOrderId && (
            <>
              <div className="text-center">
                <h1 className="text-2xl font-semibold mb-4">
                  {selectedWorkOrder?.description}
                </h1>
                <button
                  onClick={() => startWorkOrder(selectedWorkOrderId)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 mr-1"
                >
                  {t('start')}
                </button>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 mr-1">
                  {t('pause')}
                </button>
                <button
                  onClick={() => finishWorkOrder(selectedWorkOrderId)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  {t('end')}
                </button>
              </div>
              {/*selectedWorkOrderId !== null &&
                WorkOrder.find(
                  (op) => op.id === selectedWorkOrderId
                )?.workOrderInspectionPoint.map((point) => (
                  <div key={point.inspectionPointId} className="p-1">
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={point.check}
                        className="mr-2"
                      />
                      <h4 className="text-lg font-semibold">
                        {point.description}
                      </h4>
                    </div>
                  </div>
                ))*/}
              <div>
                <p className="text-xl font-bold mb-4">{t('spare.parts')}</p>
                <div>
                  {selectedWorkOrderId !== null &&
                    WorkOrder.find(
                      op => op.id === selectedWorkOrderId
                    )?.workOrderSpareParts?.map(sparePart => (
                      <div
                        key={sparePart.id}
                        className="bg-white rounded-md shadow-md p-4 mb-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-lg font-semibold truncate w-3/4">
                            {sparePart.sparePart.description}
                          </h4>
                          <h4 className="text-lg font-semibold">
                            {t('stock')}: {sparePart.sparePart.stock}
                          </h4>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="text-center">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 mr-1">
                  {t('save')}
                </button>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 mr-1">
                  {t('spare.parts')}
                </button>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 mr-1">
                  {t('notes')}
                </button>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2 mr-1">
                  {t('manual')}
                </button>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  {t('finalize')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="bg-gray-200 p-4 text-white">
        <div className="container mx-auto">
          <div className="flex justify-center">
            <button
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold h-full border-2 border-white px-4 ${
                showPreventive ? 'bg-blue-700' : ''
              }`}
              onClick={() => toggleVisibility('Preventive')}
            >
              {t('predictive')}
            </button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold h-full border-2 border-white px-4">
              {t('corrective')}
            </button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold h-full border-2 border-white px-4">
              {t('preventive')}
            </button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold h-full border-2 border-white px-4">
              {t('spare.parts')}
            </button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold h-full border-2 border-white px-4">
              {t('manual')}
            </button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold h-full border-2 border-white px-4">
              {t('history')}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MachineDetailsPage;
