"use client";

import "react-datepicker/dist/react-datepicker.css";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { SubmitHandler, useForm } from "react-hook-form";
import { Asset } from "app/interfaces/Asset";
import InspectionPoint from "app/interfaces/inspectionPoint";
import Operator from "app/interfaces/Operator";
import { Preventive, UpdatePreventiveRequest } from "app/interfaces/Preventive";
import SparePart from "app/interfaces/SparePart";
import AssetService from "app/services/assetService";
import InspectionPointService from "app/services/inspectionPointService";
import OperatorService from "app/services/operatorService";
import PreventiveService from "app/services/preventiveService";
import ChooseInspectionPoint from "components/inspectionPoint/ChooseInspectionPoint";
import Container from "components/layout/Container";
import MainLayout from "components/layout/MainLayout";
import ChooseOperatorV2 from "components/operator/ChooseOperatorV2";
import { ElementList } from "components/selector/ElementList";
import ca from "date-fns/locale/ca";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useRouter } from "next/navigation";

import { WorkOrderPerPreventive } from "./components/WorkOrderPerPreventive";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function EditPreventive({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [preventiveData, setPreventiveData] = useState<Preventive | null>(null);
  const { register, handleSubmit, setValue } = useForm<Preventive>();
  const [availableSpareParts, setAvailableSpareParts] = useState<SparePart[]>(
    []
  );
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string[]>([]);
  const [selectedInspectionPoints, setSelectedInspectionPoints] = useState<
    string[]
  >([]);
  const [availableInspectionPoints, setAvailableInspectionPoints] = useState<
    InspectionPoint[]
  >([]);
  const inspectionPointService = new InspectionPointService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ""
  );
  const preventiveService = new PreventiveService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ""
  );
  const operatorService = new OperatorService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ""
  );
  const assetService = new AssetService(process.env.NEXT_PUBLIC_API_BASE_URL!);

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [assets, setAssets] = useState<ElementList[]>([]);
  const [active, setActive] = useState<boolean>(true);

  const fetchPreventiveData = async (): Promise<Preventive> => {
    try {
      const preventiveData = await preventiveService.getPreventive(
        params.id as string
      );
      return preventiveData;
    } catch (error) {
      console.error("Error fetching machine data:", error);
      return {} as Preventive;
    }
  };

  const fetchInspectionPoints = async (preventive: Preventive) => {
    const inspectionPoints =
      await inspectionPointService.getAllInspectionPoints();
    setAvailableInspectionPoints(
      inspectionPoints.filter((x) => x.active == true)
    );

    const selected = preventive?.inspectionPoints?.map(
      (inspectionPoints) => inspectionPoints.id
    );
    setSelectedInspectionPoints(selected ?? []);
  };

  const fetchAssets = async () => {
    try {
      const assets = await assetService.getAll();
      const elements: ElementList[] = [];

      const addAssetAndChildren = (asset: Asset) => {
        elements.push({
          id: asset.id,
          description: asset.description,
        });

        asset.childs.forEach((childAsset) => {
          addAssetAndChildren(childAsset);
        });
      };

      assets.forEach((asset) => {
        addAssetAndChildren(asset);
      });

      setAssets(elements);
    } catch (error) {
      console.error("Error al obtener activos:", error);
    }
  };

  const fetchOperators = async (preventive: Preventive) => {
    await operatorService.getOperators().then((workOperator) => {
      setOperators(workOperator);
      const selected = preventive?.operators?.map((operators) => operators.id);
      setSelectedOperator(selected ?? []);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (params.id) {
        const data = await fetchPreventiveData();
        if (data) {
          setPreventiveData(data);
          setValue("code", data.code);
          setValue("description", data.description);
          setValue("hours", data.hours);
          setValue("days", data.days);
          setValue("startExecution", data.startExecution);
          const finalData = new Date(data.startExecution);
          setValue("asset", data.asset);
          setValue("active", data.active);
          setValue("lastExecution", data.lastExecution);
          setStartDate(finalData);
          await fetchInspectionPoints(data);
          await fetchOperators(data);
        }
      }
    };
    fetchData();
  }, [params.id]);

  const handleCancel = () => {
    router.back();
  };

  const onSubmit: SubmitHandler<Preventive> = async (data: any) => {
    try {
      const response = await preventiveService.updatePreventive(
        convertToUpdateWorkOrderRequest(data)
      );

      if (response) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          history.back();
        }, 2000);
      } else {
        setTimeout(() => {
          setShowErrorMessage(false);
        }, 2000);
      }
    } catch (error) {
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 2000);
    }
  };

  function convertToUpdateWorkOrderRequest(
    preventive: Preventive
  ): UpdatePreventiveRequest {
    const updatePreventiveRequest: UpdatePreventiveRequest = {
      id: params.id as string,
      code: preventive.code,
      description: preventive.description,
      startExecution: startDate!,
      days: preventive.days,
      counter: preventive.counter,
      assetId: [preventive.asset?.id],
      inspectionPointId: selectedInspectionPoints.map((point) => point),
      operatorId: selectedOperator.map((sparePart) => sparePart),
      active: preventive.active,
      plannedDuration: "",
    };
    return updatePreventiveRequest;
  }

  const handleInspectionPointSelected = (pointId: string) => {
    setSelectedInspectionPoints((prevSelected) => [...prevSelected, pointId]);
  };
  const handleDeleteInspectionPointSelected = (pointId: string) => {
    setSelectedInspectionPoints((prevSelected) =>
      prevSelected.filter((id) => id !== pointId)
    );
  };
  const handleSelectedOperator = (id: string) => {
    setSelectedOperator((prevSelected) => [...prevSelected, id]);
  };
  const handleDeleteSelectedOperator = (idOperator: string) => {
    setSelectedOperator((prevSelected) =>
      prevSelected.filter((id) => id !== idOperator)
    );
  };

  return (
    <MainLayout>
      <Container>
        <div className="flex gap-2">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto bg-white p-4 rounded shadow-md w-full"
          >
            <p className="text-lg font-semibold mb-2">Editar Revisió</p>
            <div className="grid grid-cols-4 w-full gap-4 py-4">
              <div className="col-span-2">
                <label
                  className="text-gray-700 font-bold text-sm"
                  htmlFor="code"
                >
                  Codi
                </label>
                <input
                  {...register("code")}
                  id="code"
                  type="text"
                  className="form-input border border-gray-300 rounded-md w-full"
                />
              </div>
              <div className="col-span-2">
                <label
                  className="text-gray-700 font-bold mb-2 text-sm"
                  htmlFor="description"
                >
                  Descripció
                </label>
                <input
                  {...register("description")}
                  id="description"
                  type="text"
                  className="form-input border border-gray-300 rounded-md w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 w-full gap-4 py-4">
              <div className="col-span-2">
                <label
                  className="block text-gray-700 font-bold mb-2 text-sm"
                  htmlFor="days"
                >
                  Freqüència Dies
                </label>
                <input
                  {...register("days")}
                  id="days"
                  type="number"
                  className="form-input border border-gray-300 rounded-md w-full"
                />
              </div>
              <div className="col-span-2">
                <label
                  className="block text-gray-700 font-bold mb-2 text-sm"
                  htmlFor="startExecution"
                >
                  Primera Execució
                </label>
                <DatePicker
                  id="startDate"
                  selected={startDate}
                  onChange={(date: Date) => setStartDate(date)}
                  dateFormat="dd/MM/yyyy"
                  locale={ca}
                  className="border border-gray-300 p-2 rounded-md mr-4 w-full"
                />
              </div>
              {preventiveData?.lastExecution && (
                <div className="col-span-2">
                  <label
                    className="block text-gray-700 font-bold mb-2 text-sm"
                    htmlFor="startExecution"
                  >
                    Última Execució
                  </label>
                  <div>
                    {dayjs
                      .utc(preventiveData?.lastExecution, "Europe/Madrid")
                      .format("DD/MM/YYYY")}
                  </div>
                </div>
              )}
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}
            <div className="flex flex-row gap-8 w-full ">
              <ChooseInspectionPoint
                preventiveInspectionPoints={availableInspectionPoints}
                onInspectionPointSelected={handleInspectionPointSelected}
                onDeleteInspectionPointSelected={
                  handleDeleteInspectionPointSelected
                }
                preventiveSelectedInspectionPoints={selectedInspectionPoints}
              />
              <ChooseOperatorV2
                availableOperators={operators.filter((x) => x.active == true)}
                preventiveSelectedOperators={selectedOperator}
                onDeleteSelectedOperator={handleDeleteSelectedOperator}
                onSelectedOperator={handleSelectedOperator}
              />
            </div>
            <div className="gap-2 flex items-center jusitfy-center py-4">
              <p className="text-gray-700 font-bold text-sm">Activa:</p>
              <input
                {...register("active")}
                id="active"
                className="flex"
                type="checkbox"
              />
            </div>
            <div className="flex text-black">
              <p className="font-semibold">
                Equip assignat: {preventiveData?.asset?.description}
              </p>
            </div>
            <div className="flex flex-row gap-4">
              <button
                type="submit"
                className={`${
                  showSuccessMessage
                    ? "bg-green-500"
                    : showErrorMessage
                    ? "bg-red-500"
                    : "bg-okron-btCreate"
                } hover:${
                  showSuccessMessage
                    ? "bg-green-700"
                    : showErrorMessage
                    ? "bg-red-700"
                    : "bg-blue-700"
                } text-white font-bold py-2 px-4 rounded mt-6`}
              >
                Actualitzar Revisió
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-6"
              >
                Cancelar
              </button>
            </div>
            <div className="flex my-4 w-full">
              {showSuccessMessage && (
                <div className="bg-green-200 text-green-800 p-4 rounded mb-4">
                  Revisió actualitzada correctament
                </div>
              )}
              {showErrorMessage && (
                <div className="bg-red-200 text-red-800 p-4 rounded mb-4">
                  Error al actualitzar revisió
                </div>
              )}
            </div>
          </form>
          <WorkOrderPerPreventive id={params.id} />
        </div>
      </Container>
    </MainLayout>
  );
}
