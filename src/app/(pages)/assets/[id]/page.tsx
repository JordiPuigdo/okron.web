'use client';

import { useEffect, useState } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@tremor/react';
import Downtimes from 'app/(pages)/machines/downtimes/downtime';
import PreventiveTable from 'app/(pages)/preventive/preventiveTable/preventiveTable';
import SparePartTable from 'app/(pages)/spareParts/components/SparePartTable';
import WorkOrderTable from 'app/(pages)/workOrders/components/WorkOrderTable';
import { SvgMachines, SvgSpinner } from 'app/icons/icons';
import {
  Asset,
  CreateAssetRequest,
  UpdateAssetRequest,
} from 'app/interfaces/Asset';
import AssetService from 'app/services/assetService';
import { useSessionStore } from 'app/stores/globalStore';
import { CostsObjectComponent } from 'components/Costs/CostsObject';
import Container from 'components/layout/Container';
import MainLayout from 'components/layout/MainLayout';

import AssetForm from '../components/assetForm';

export default function AssetDetailsPage({
  params,
}: {
  params: { id: string; parentId: string };
}) {
  const id = params.id;
  const [loading, setLoading] = useState(false);
  const assetService = new AssetService(process.env.NEXT_PUBLIC_API_BASE_URL!);
  const [isloading, setIsloading] = useState(true);
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);
  const [parentAsset, setParentAsset] = useState<Asset | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [levelGetted, setLevelGetted] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const { loginUser } = useSessionStore();

  useEffect(() => {
    fetch();
  }, [id, parentId]);

  async function fetch() {
    if (id !== '0') {
      setLoading(true);
      assetService
        .getAssetById(id as string)
        .then((asset: Asset) => {
          setCurrentAsset(asset);
          setDescription(asset.description);
          setCode(asset.code);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching asset data:', error);
          setLoading(false);
        });
    }
    if (parentId) {
      assetService.getAssetById(parentId as string).then((asset: Asset) => {
        setParentAsset(asset);
      });
    }
    setIsloading(false);
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const parentId = urlParams.get('parentId');
    const level = urlParams.get('level');

    setParentId(parentId);
    setLevelGetted(level?.toString() ? parseInt(level) : 1);
  }, []);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      if (id !== '0') {
        const newData: UpdateAssetRequest = {
          code: data.code,
          description: data.description,
          id: id,
          active: data.active,
          level: data.level,
          parentId: data.parentId,
          createWorkOrder: data.createWorkOrder,
        };
        await assetService.updateAsset(id, newData).then(data => {
          if (data) {
            setMessage('Actualitzat correctament');
            setTimeout(() => {
              history.back();
            }, 2000);
          } else {
            setErrorMessage("Error actualitzant l'equip");
          }
        });
      } else {
        const newData: CreateAssetRequest = {
          code: data.code,
          description: data.description,
          level: levelGetted!,
          parentId: parentId!,
          createWorkOrder: data.createWorkOrder,
        };
        await assetService
          .createAsset(newData)
          .then(data => {
            if (data) {
              setMessage('Creat correctament');
              setTimeout(() => {
                history.back();
              }, 2000);
            } else {
              setErrorMessage("Error creant l'equip");
            }
          })
          .catch(x => {
            setErrorMessage('Error : ' + x.message);
          });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      setLoading(false);
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex w-full py-4">
        <div className="w-full flex flex-col gap-2 items">
          <h2 className="text-2xl font-bold text-black flex gap-2">
            <SvgMachines />
            {currentAsset
              ? currentAsset?.path
              : parentAsset?.path + '/' + description}
          </h2>
          <span className="text-l">
            Equip: {code} - {description}
          </span>
        </div>
      </div>
    );
  };

  const handleOnChange = async (header: string, value: string) => {
    if (header === 'code') {
      setCode(value);
    }
    if (header === 'description') {
      setDescription(value);
    }
    // setDescription(data.description);
    // setCode(data.code);
  };

  return (
    <MainLayout>
      <Container>
        {isloading ? (
          <SvgSpinner className="items-center justify-center" />
        ) : (
          <>
            {renderHeader()}
            <div className="flex flex-row gap-5">
              <div className="w-full flex flex-col gap-5">
                <div className="flex justify-start gap-12 bg-white shadow-md rounded-md w-full p-2">
                  <AssetForm
                    id={id}
                    loading={loading}
                    assetData={currentAsset != null ? currentAsset : undefined}
                    level={levelGetted!}
                    parentId={parentId != null ? parentId : ''}
                    onSubmit={onSubmit}
                    onChange={handleOnChange}
                    onReload={fetch}
                  />
                </div>
                <div className="w-full flex flex-col gap-5 bg-white shadow-md rounded-md p-4">
                  <CostsObjectComponent assetId={id} loginUser={loginUser!} />
                </div>
              </div>
              <div>
                <Downtimes assetId={id} />
              </div>

              {message && (
                <div className="bg-green-200 text-green-800 p-4 rounded my-4">
                  {message}
                </div>
              )}
              {errorMessage && (
                <div className="bg-red-200 text-red-800 p-4 rounded my-4">
                  {errorMessage}
                </div>
              )}
            </div>
            {id != '0' && (
              <div className="flex flex-col gap-4">
                <div>
                  <TabGroup className="bord">
                    <TabList className="mt-4">
                      <Tab className="font-semibold">Ordres de treball</Tab>
                      <Tab className="font-semibold">Revisions</Tab>
                      <Tab className="font-semibold">Recanvis</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel>
                        <WorkOrderTable
                          enableFilters={true}
                          enableEdit={false}
                          enableDelete={false}
                          enableDetail={true}
                          assetId={id}
                        />
                      </TabPanel>
                      <TabPanel>
                        <PreventiveTable
                          enableFilters={true}
                          enableDelete={false}
                          enableEdit={true}
                          assetId={id}
                        />
                      </TabPanel>
                      <TabPanel>
                        <SparePartTable
                          enableFilters={true}
                          enableEdit={false}
                          enableDelete={false}
                          enableDetail={true}
                          enableCreate={false}
                          assetId={id}
                          enableFilterActive={false}
                        />
                      </TabPanel>
                    </TabPanels>
                  </TabGroup>
                </div>
              </div>
            )}
          </>
        )}
      </Container>
    </MainLayout>
  );
}
