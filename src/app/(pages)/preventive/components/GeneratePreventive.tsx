'use client';

import { useEffect, useState } from 'react';
import { SvgClose, SvgSpinner } from 'app/icons/icons';
import { Preventive } from 'app/interfaces/Preventive';
import { UserPermission } from 'app/interfaces/User';
import PreventiveService from 'app/services/preventiveService';
import WorkOrderService from 'app/services/workOrderService';
import { useGlobalStore, useSessionStore } from 'app/stores/globalStore';
import { formatDate } from 'app/utils/utils';
import { Button } from 'designSystem/Button/Buttons';
import { Modal } from 'designSystem/Modals/Modal';

interface PreventiveCreateds {
  key: Preventive;
  value: number;
}

const GeneratePreventive = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [preventivesCreated, setPreventivesCreated] = useState<
    Preventive[] | null
  >([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const preventiveService = new PreventiveService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );
  const workOrderService = new WorkOrderService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  const { loginUser, operatorLogged } = useSessionStore(state => state);
  const { setIsModalOpen } = useGlobalStore(state => state);

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (preventivesCreated != null && preventivesCreated?.length > 0) {
      setShowModal(true);
    }
  }, [preventivesCreated]);

  const generateWorkOrders = async () => {
    if (operatorLogged == undefined) {
      alert('Has de tenir un operari fitxat per fer aquesta acció');
      return;
    }
    if (isLoading) return;
    setIsLoading(true);
    const preventives = await preventiveService.CreateWorkOrderPreventivePerDay(
      loginUser!.agentId,
      operatorLogged!.idOperatorLogged
    );
    if (preventives?.length! > 0) {
      const prevCreat: PreventiveCreateds[] = [];
      preventives?.forEach(x => {
        if (prevCreat.find(y => y.key.id === x.id)) {
          prevCreat.find(y => y.key.id === x.id)!.value++;
        } else {
          prevCreat.push({ key: x, value: 0 });
        }
      });
      setPreventivesCreated(prevCreat.map(x => x.key));
      workOrderService.cleanCache();
      /*  setTimeout(() => {
        setPreventivesCreated([]);
      }, 10000);*/
    } else {
      setMessage('Avui no hi ha revisions per crear');
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }

    setIsLoading(false);
  };
  if (loginUser?.permission == UserPermission.Administrator)
    return (
      <>
        <Modal
          type="center"
          height="h-auto"
          width="w-full"
          className="max-w-lg mx-auto border-4 border-blue-950 p-2"
          isVisible={showModal}
          avoidClosing={true}
        >
          <>
            <div className="rounded-lg shadow-md w-full">
              <div className="relative bg-white">
                <div className="absolute top-0 right-0 justify-end hover:cursor-pointer">
                  <SvgClose
                    onClick={() => {
                      setIsModalOpen(false);
                    }}
                  />
                </div>
              </div>
            </div>
            {preventivesCreated != undefined &&
              preventivesCreated?.length > 0 && (
                <>
                  <p className="text-black font-semibold">
                    {(preventivesCreated?.length || 0 > 0) &&
                      'Revisions creades:'}
                  </p>
                  {preventivesCreated?.map((preventive, index) => (
                    <div key={index}>
                      {preventive.code} - {preventive.description}
                    </div>
                  ))}
                  {message != '' && (
                    <span className="text-red-500">{message}</span>
                  )}
                </>
              )}
          </>
        </Modal>
        <div className="flex items-center">
          <Button
            onClick={generateWorkOrders}
            customStyles="flex bg-white border-okron-main text-okron-main text-sm sm:text-xs md:text-sm lg:text-base rounded-md font-semibold hover:bg-[#E7DDFC] hover:border-okron-main border-2 w-full overflow-hidden text-ellipsis whitespace-nowrap"
          >
            Generar Revisions {formatDate(new Date(), false, false)}
            {isLoading && <SvgSpinner className=" w-6 h-6" />}
          </Button>
        </div>
      </>
    );
  else return <></>;
};

export default GeneratePreventive;
