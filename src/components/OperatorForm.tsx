import React from "react";
import { Controller, SubmitHandler,useForm } from "react-hook-form";
import Operator, { OperatorType } from "app/interfaces/Operator";
import { translateOperatorType } from "app/utils/utils";

type OperatorFormProps = {
  operator?: Operator;
  onSubmit: SubmitHandler<Operator>;
  onCancel: () => void;
  onDelete?: () => void;
  onUpdatedSuccesfully?: boolean | null;
};

const OperatorForm: React.FC<OperatorFormProps> = ({
  operator,
  onSubmit,
  onCancel,
  onDelete,
  onUpdatedSuccesfully,
}) => {
  const { handleSubmit, control, reset } = useForm<Operator>({
    defaultValues: operator,
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-lg p-6 shadow-md"
    >
      <div className="mb-4">
        <label
          htmlFor="code"
          className="block text-sm font-medium text-gray-700"
        >
          Codi Operari
        </label>
        <Controller
          name="code"
          control={control}
          defaultValue={operator ? operator.code : ""}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder="Codi Operari"
              className="border rounded-md w-full px-3 py-2 mt-1 text-gray-700 focus:outline-none focus:border-indigo-500"
            />
          )}
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Nom
        </label>
        <Controller
          name="name"
          control={control}
          defaultValue={operator ? operator.name : ""}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder="Nom"
              className="border rounded-md w-full px-3 py-2 mt-1 text-gray-700 focus:outline-none focus:border-indigo-500"
            />
          )}
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Preu Hora
        </label>
        <Controller
          name="priceHour"
          control={control}
          defaultValue={operator ? operator.priceHour : 0}
          render={({ field }) => (
            <input
              {...field}
              type="number"
              placeholder="Preu / Hora"
              className="border rounded-md w-full px-3 py-2 mt-1 text-gray-700 focus:outline-none focus:border-indigo-500"
            />
          )}
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Tipus
        </label>
        <Controller
          name="operatorType"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="border rounded-md w-full px-3 py-2 mt-1 text-gray-700 focus:outline-none focus:border-indigo-500"
              onChange={(e) => {
                const selectedValue = parseInt(e.target.value, 10);
                field.onChange(selectedValue);
              }}
            >
              {Object.values(OperatorType)
                .filter((value) => typeof value === "number")
                .map((operatorType) => (
                  <option key={operatorType} value={Number(operatorType)}>
                    {translateOperatorType(operatorType as OperatorType)}
                  </option>
                ))}
            </select>
          )}
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Actiu
        </label>
        <Controller
          name="active"
          control={control}
          defaultValue={operator ? operator.active : true}
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
      <div className="flex items-center space-x-4">
        <button
          type="submit"
          className="bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={() => {
            onCancel();
          }}
          className="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-100"
        >
          Cancelar
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-red-600 hover:text-red-900 font-semibold focus:outline-none"
          >
            Eliminar
          </button>
        )}

        {onUpdatedSuccesfully !== null && (
          <div
            className={`mb-4 ${
              onUpdatedSuccesfully ? "text-green-600" : "text-red-600"
            } text-center`}
          >
            {onUpdatedSuccesfully
              ? "Operari actualitzat correctament!"
              : "Error actualitzant operari!"}
          </div>
        )}
      </div>
    </form>
  );
};

export default OperatorForm;
