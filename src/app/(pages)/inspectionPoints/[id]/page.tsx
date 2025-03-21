"use client";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { SvgSpinner } from "app/icons/icons";
import InspectionPoint from "app/interfaces/inspectionPoint";
import InspectionPointService from "app/services/inspectionPointService";
import Container from "components/layout/Container";
import MainLayout from "components/layout/MainLayout";

export default function EditInspectionPoint({
  params,
}: {
  params: { id: string };
}) {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inspectionPoint, setInspectionPoint] =
    useState<InspectionPoint | null>(null);
  const inspectionPointService = new InspectionPointService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ""
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<InspectionPoint>({
    defaultValues: {},
  });

  useEffect(() => {
    const fetchInspectionPoint = async () => {
      setIsLoading(true);
      try {
        await inspectionPointService
          .getInspectionPointById(params.id)
          .then((fetchedInspectionPoint) => {
            setIsLoading(false);
            if (!fetchedInspectionPoint) return;
            setInspectionPoint(fetchedInspectionPoint);
            setValue("id", fetchedInspectionPoint.id);
            setValue("description", fetchedInspectionPoint.description);
            setValue("active", fetchedInspectionPoint.active);
          });
      } catch (error) {
        console.error("Error fetching inspection point:", error);
        setIsLoading(false);
        setShowErrorMessage(true);
      }
    };
    if (inspectionPoint) return;
    fetchInspectionPoint();
  }, [params.id, inspectionPointService]);

  const onSubmit: SubmitHandler<InspectionPoint> = async (formData) => {
    setIsLoading(true);
    try {
      await inspectionPointService.updateInspectionPoint(params.id, formData);
      setIsLoading(false);
      setShowSuccessMessage(true);
      setTimeout(() => {
        history.back();
      }, 2000);
    } catch (error) {
      console.error("Error updating inspection point:", error);
      setIsLoading(false);
      setShowErrorMessage(true);
    }
  };

  const handleCancel = () => {
    history.back();
  };

  return (
    <MainLayout>
      <Container>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 bg-white rounded-xl p-4"
        >
          {isLoading ? (
            <div>Loading...</div>
          ) : inspectionPoint ? (
            <div className="flex flex-row md:flex-row justify-center gap-8 w-1/2 items-center">
              <div className="flex flex-col flex-grow gap-4">
                <label className="block text-gray-700 font-medium mb-2 text-lg">
                  Descripció
                </label>
                <input
                  {...register("description")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />

                <label className="block text-gray-700 font-medium mb-2 text-lg ">
                  Actiu
                  <input
                    type="checkbox"
                    {...register("active")}
                    className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 ml-4"
                  />
                </label>
              </div>
            </div>
          ) : (
            <SvgSpinner />
          )}
          <div className="flex flex-row gap-4 items-center space-x-4">
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
              } text-white font-bold py-2 px-4 rounded mt-6 flex items-center justify-center`}
            >
              Actualitzar Punt d'inspecció
              {isLoading && <SvgSpinner style={{ marginLeft: "0.5rem" }} />}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-6 flex items-center justify-center"
            >
              Cancelar
            </button>
            {showSuccessMessage && (
              <div className="bg-green-200 text-green-800 p-4 rounded mb-4">
                Punt Actualitzat Correctament
              </div>
            )}

            {showErrorMessage && (
              <div className="bg-red-200 text-red-800 p-4 rounded mb-4">
                Error al actualitzar el punt d'inspecció
              </div>
            )}
          </div>
        </form>
      </Container>
    </MainLayout>
  );
}
