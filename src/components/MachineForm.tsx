import React, { useEffect, useState } from "react";
import { Controller,useForm } from "react-hook-form";
import Machine from "app/interfaces/machine";
import Section from "app/interfaces/Section";
import MachineService from "app/services/machineService";
import SectionService from "app/services/sectionService";

type MachineFormProps = {
  machine: Machine;
  onSubmit: (data: Machine) => void;
  onCancel: () => void;
};

const MachineForm: React.FC<MachineFormProps> = ({
  machine,
  onSubmit,
  onCancel,
}) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting, isDirty, isSubmitSuccessful },
  } = useForm<Machine>({ defaultValues: machine });
  const machineService = new MachineService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ""
  );

  const sectionService = new SectionService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ""
  );
  const [sections, setSections] = useState<Section[]>([]);
  useEffect(() => {
    async function getSection() {
      const response = await sectionService.getSections();
      if (response.length > 0) {
        setSections(response);
        if (machine.section == null) {
          setSection(response[0]);
        }
      }
    }
    getSection();
  }, []);

  const [section, setSection] = useState<Section | null>(null);

  const handleFormSubmit = async (data: Machine) => {
    try {
      const machineData: Machine = {
        ...data,
        section: section!,
        serialNumber: data.serialNumber,
        company: data.company,
        year: data.year,
        hours: data.hours,
        workOrder: data.workOrder,
        active: data.active,
      };
      const response = await machineService.updateMachine(
        machine.id,
        machineData
      );
      if (response) {
        // setTimeout(() => {
        //   history.back();
        // }, 2000);
      }
      onSubmit(data);
    } catch (error) {
      console.error("Error updating machine:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="w-full max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg"
    >
      {isSubmitSuccessful && (
        <div className="mb-4 text-green-500 text-center">
          Màquina actualitzada correctament!
        </div>
      )}
      <div className="mb-4">
        <label htmlFor="code" className="block font-medium text-gray-700">
          Codi
        </label>
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="border rounded-md w-full px-3 py-2 mt-1 text-gray-700 focus:outline-none focus:border-indigo-500"
            />
          )}
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="description"
          className="block font-medium text-gray-700"
        >
          Nom
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="border rounded-md w-full px-3 py-2 mt-1 text-gray-700 focus:outline-none focus:border-indigo-500"
            />
          )}
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="serialNumber"
          className="block font-medium text-gray-700"
        >
          Número de Sèrie
        </label>
        <Controller
          name="serialNumber"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="border rounded-md w-full px-3 py-2 mt-1 text-gray-700 focus:outline-none focus:border-indigo-500"
            />
          )}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="company" className="block font-medium text-gray-700">
          Empresa
        </label>
        <Controller
          name="company"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="border rounded-md w-full px-3 py-2 mt-1 text-gray-700 focus:outline-none focus:border-indigo-500"
            />
          )}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="section" className="block font-medium text-gray-700">
          Secció
        </label>
        <Controller
          name="section"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="border rounded-md w-full px-3 py-2 mt-1 text-gray-700 focus:outline-none focus:border-indigo-500"
              value={field.value?.id}
              onChange={(e) => {
                const selectedSection = sections.find(
                  (section) => section.id === e.target.value
                );
                setSection(selectedSection!);
                setValue("section", selectedSection || null);
              }}
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.description}
                </option>
              ))}
            </select>
          )}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="year" className="block font-medium text-gray-700">
          Any
        </label>
        <Controller
          name="year"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="border rounded-md w-full px-3 py-2 mt-1 text-gray-700 focus:outline-none focus:border-indigo-500"
            />
          )}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="hours" className="block font-medium text-gray-700">
          Hores
        </label>
        <Controller
          name="hours"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="border rounded-md w-full px-3 py-2 mt-1 text-gray-700 focus:outline-none focus:border-indigo-500"
            />
          )}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="active" className="block font-medium text-gray-700">
          Activa
        </label>
        <Controller
          name="active"
          control={control}
          defaultValue={machine.active}
          render={({ field }) => (
            <input
              type="checkbox"
              className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              checked={field.value as boolean}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
      >
        {isSubmitting ? "Guardant..." : "Guardar"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-100 ml-1"
      >
        Cancelar
      </button>
    </form>
  );
};

export default MachineForm;
