'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@tremor/react';
import Downtimes from 'app/(pages)/machines/downtimes/downtime';
import PreventiveTable from 'app/(pages)/preventive/preventiveTable/preventiveTable';
import SparePartTable from 'app/(pages)/spareParts/components/SparePartTable';
import WorkOrderTable from 'app/(pages)/workOrders/components/WorkOrderTable';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import { Asset, AssetType, CreateAssetRequest, UpdateAssetRequest } from 'app/interfaces/Asset';
import { assetService } from 'app/services/assetService';
import { useSessionStore } from 'app/stores/globalStore';
import { CostsObjectComponent } from 'components/Costs/CostsObject';
import Container from 'components/layout/Container';
import { HeaderForm } from 'components/layout/HeaderForm';
import MainLayout from 'components/layout/MainLayout';
import { EntityTable } from 'components/table/interface/tableEntitys';

import AssetForm, { AssetFormData } from '../components/assetForm';

export default function AssetDetailsPage({
  params,
}: {
  params: { id: string; parentId: string };
}) {
  const id = params.id;
  const { t } = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);
  const [parentAsset, setParentAsset] = useState<Asset | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [levelGetted, setLevelGetted] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const { config, loginUser } = useSessionStore();

  useEffect(() => {
    loadAsset();
  }, [id, parentId]);

  async function loadAsset() {
    if (id !== '0') {
      setLoading(true);
      try {
        const asset = await assetService.getAssetById(id);
        setCurrentAsset(asset);
        setDescription(asset.description);
        setCode(asset.code);
      } catch (error) {
        console.error('Error fetching asset data:', error);
      } finally {
        setLoading(false);
      }
    }
    if (parentId) {
      try {
        const asset = await assetService.getAssetById(parentId);
        setParentAsset(asset);
      } catch (error) {
        console.error('Error fetching parent asset:', error);
      }
    }
    setIsLoading(false);
  }

  const [returnSearch, setReturnSearch] = useState<string>('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const parentIdParam = urlParams.get('parentId');
    const level = urlParams.get('level');
    const search = urlParams.get('search') ?? '';
    setParentId(parentIdParam);
    setLevelGetted(level ? parseInt(level) : 1);
    setReturnSearch(search);
  }, []);

  const onSubmit = async (data: AssetFormData) => {
    setLoading(true);
    try {
      if (id !== '0') {
        const updateData: UpdateAssetRequest = {
          code: data.code,
          description: data.description,
          id,
          active: data.active,
          level: currentAsset?.level ?? 1,
          parentId: currentAsset?.parentId ?? '',
          createWorkOrder: data.createWorkOrder,
          brand: data.brand,
          assetType: data.assetType,
        };
        await assetService.updateAsset(updateData);
        setMessage(t('updated.successfully'));
        setTimeout(() => router.push(`/assets?search=${encodeURIComponent(returnSearch)}&id=${id}`), 2000);
      } else {
        const createData: CreateAssetRequest = {
          code: data.code,
          description: data.description,
          level: levelGetted!,
          parentId: parentId ?? '',
          createWorkOrder: data.createWorkOrder,
          brand: data.brand,
          assetType: data.assetType ?? AssetType.Default,
        };
        await assetService.createAsset(createData);
        setMessage(t('created.successfully'));
        setTimeout(() => history.back(), 2000);
      }
    } catch (error) {
      const err = error as Error;
      setErrorMessage(t('error') + ': ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOnChange = async (header: string, value: string) => {
    if (header === 'code') setCode(value);
    if (header === 'description') setDescription(value);
  };

  return (
    <MainLayout>
      <Container>
        {isLoading ? (
          <SvgSpinner className="items-center justify-center" />
        ) : (
          <>
            <HeaderForm
              header={
                currentAsset?.path ??
                (parentAsset?.path
                  ? parentAsset.path + '/' + description
                  : t('new.equipment')) ??
                t('new.equipment')
              }
              isCreate={id === '0'}
              subtitle={`${t('equipment')}: ${code} - ${description}`}
              entity={EntityTable.ASSET}
            />
            <div className="flex flex-row gap-5">
              <div className="w-full flex flex-col gap-5">
                <div className="flex flex-col justify-start gap-12 bg-white shadow-md rounded-md w-full p-2">
                  <AssetForm
                    id={id}
                    loading={loading}
                    assetData={currentAsset ?? undefined}
                    level={levelGetted!}
                    parentId={parentId ?? ''}
                    onSubmit={onSubmit}
                    onChange={handleOnChange}
                    onReload={loadAsset}
                  />
                  <div>
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
                </div>
                <div className="w-full flex flex-col gap-5 bg-white shadow-md rounded-md p-4">
                  <CostsObjectComponent assetId={id} loginUser={loginUser!} />
                </div>
              </div>
              {!config?.isCRM && (
                <div>
                  <Downtimes assetId={id} />
                </div>
              )}
            </div>
            {id !== '0' && (
              <div className="flex flex-col gap-4">
                <div>
                  <TabGroup className="bord">
                    <TabList className="mt-4">
                      <Tab className="font-semibold">{t('work.orders')}</Tab>
                      <Tab className="font-semibold">{t('revisions')}</Tab>
                      <Tab className="font-semibold">{t('spare.parts')}</Tab>
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
