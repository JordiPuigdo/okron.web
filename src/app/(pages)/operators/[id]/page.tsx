'use client';

import { BaseSyntheticEvent, useEffect, useState } from 'react';
import { SvgMachines } from 'app/icons/icons';
import Operator, { OperatorType } from 'app/interfaces/Operator';
import { Preventive } from 'app/interfaces/Preventive';
import OperatorService from 'app/services/operatorService';
import PreventiveService from 'app/services/preventiveService';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';
import OperatorForm from 'components/OperatorForm';

import PreventiveAssignment from './PreventiveAssignament';

export default function EditOperatorPage({
  params,
}: {
  params: { id: string };
}) {
  const operatorService = new OperatorService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );
  const preventiveService = new PreventiveService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );
  const [isUpdateSuccessful, setIsUpdateSuccessful] = useState<boolean | null>(
    null
  );

  const [operatorPreventives, setOperatorPreventives] = useState<
    Preventive[] | null
  >(null);

  const [preventives, setPreventives] = useState<Preventive[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOperatorData = async () => {
    try {
      setIsUpdateSuccessful(null);
      const operatorData = await operatorService.getOperator(
        params.id as string
      );
      return operatorData;
    } catch (error) {
      console.error('Error fetching operator data:', error);
      return null;
    }
  };

  const fetchOperatorPreventives = async () => {
    try {
      const operatorPreventives =
        await preventiveService.getPreventiveByOperatorId(params.id as string);
      return operatorPreventives;
    } catch (error) {
      console.error('Error fetching operator preventives:', error);
      return null;
    }
  };

  const fetchPreventives = async () => {
    try {
      const preventives = await preventiveService.getPreventives();
      return preventives;
    } catch (error) {
      console.error('Error fetching preventives:', error);
      return null;
    }
  };

  const updateOperator = async (operator: Operator) => {
    if (operator.operatorType == null)
      operator.operatorType = OperatorType.Maintenance;
    await operatorService.updateOperator(operator).then(data => {
      if (data) {
        setIsUpdateSuccessful(true);
        setTimeout(() => {
          history.back();
        }, 2000);
      } else {
        setIsUpdateSuccessful(false);
      }

      setTimeout(() => {
        setIsUpdateSuccessful(null);
      }, 3000);
    });
  };
  const [operatorData, setOperatorData] = useState<Operator | null>(null);

  useEffect(() => {
    setIsUpdateSuccessful(null);
    if (params.id) {
      fetchOperatorData().then(data => {
        if (data) {
          setOperatorData(data);
        }
      });
      fetchOperatorPreventives().then(data => {
        if (data) {
          setOperatorPreventives(data);
        }
      });
      fetchPreventives().then(data => {
        if (data) {
          setPreventives(data);
        }
      });
      setIsLoading(false);
    }
  }, [params.id]);

  const renderHeader = () => {
    return (
      <div className="flex p-2 my-2">
        <div className="w-full flex flex-col gap-2 items">
          <h2 className="text-2xl font-bold text-black flex gap-2">
            <SvgMachines />
            {operatorData?.code} - {operatorData?.name}
          </h2>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <Container>
        {renderHeader()}
        {operatorData && (
          <OperatorForm
            operator={operatorData}
            onSubmit={function (
              data: Operator,
              event?: BaseSyntheticEvent<object, any, any> | undefined
            ): unknown {
              return updateOperator(data);
            }}
            onCancel={function (): void {
              history.back();
            }}
            onUpdatedSuccesfully={isUpdateSuccessful}
          />
        )}
        {!isLoading && (
          <PreventiveAssignment
            operatorId={params.id}
            preventives={preventives}
            operatorPreventives={operatorPreventives}
          />
        )}
      </Container>
    </MainLayout>
  );
}
