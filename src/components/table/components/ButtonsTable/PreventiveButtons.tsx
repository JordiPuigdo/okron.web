import { useState } from "react";
import { SvgRepeat, SvgSpinner } from "app/icons/icons";
import { Preventive } from "app/interfaces/Preventive";
import PreventiveService from "app/services/preventiveService";
import { useSessionStore } from "app/stores/globalStore";

interface PreventiveButtonsProps {
  preventive: Preventive;
  userId: string;
}

export const PreventiveButtons = ({
  preventive,
  userId,
}: PreventiveButtonsProps) => {
  const preventiveService = new PreventiveService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );
  const { operatorLogged } = useSessionStore((state) => state);
  const [isLoading, setIsLoading] = useState(false);
  const handleForceExecute = async (id: string) => {
    if (operatorLogged == undefined) {
      alert("Has de tenir un operari fitxat per fer aquesta acció");
      return;
    }
    setIsLoading(true);
    await preventiveService
      .ForceExecutePreventive(id, userId, operatorLogged!.idOperatorLogged)
      .then((data) => {
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        console.log("Error executing preventive:", error);
      });
  };
  if (preventive.lastExecution == null) return <></>;
  return (
    <div
      className="flex items-center text-white rounded-xl bg-okron-btCreate hover:bg-okron-btCreateHover hover:cursor-pointer"
      onClick={() => handleForceExecute(preventive.id)}
    >
      {isLoading ? (
        <SvgSpinner className="p-2" />
      ) : (
        <SvgRepeat className="p-2" />
      )}
    </div>
  );
};
