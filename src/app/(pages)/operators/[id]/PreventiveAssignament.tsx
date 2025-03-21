"use client";
import { useEffect, useState } from "react";
import {
  AssignOperatorToPreventivesRequest,
  Preventive,
} from "app/interfaces/Preventive";
import PreventiveService from "app/services/preventiveService";

import PreventiveOperatorTable from "./PreventiveOperatorTable";

interface PreventiveAssignmentProps {
  operatorId: string;
  preventives: Preventive[] | null;
  operatorPreventives: Preventive[] | null;
}

const PreventiveAssignment: React.FC<PreventiveAssignmentProps> = ({
  operatorId,
  preventives,
  operatorPreventives,
}) => {
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [selectedAvailable, setSelectedAvailable] = useState<Set<string>>(
    new Set()
  );
  const [selectedAssigned, setSelectedAssigned] = useState<Set<string>>(
    new Set()
  );

  const preventiveService = new PreventiveService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ""
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sample data, replace with actual state from API
  //const operatorPreventives: Preventive[] = [];
  const assignedPreventiveIds: Set<string> = new Set();

  const toggleFilter = () => setFilterAvailable(!filterAvailable);

  const [operatorPreventivesAssigneds, setOperatorPreventivesAssigneds] =
    useState<Preventive[] | null>(operatorPreventives);

  // Use useEffect to update operatorPreventivesAssigneds whenever operatorPreventives changes
  useEffect(() => {
    setOperatorPreventivesAssigneds(operatorPreventives || null);
  }, [operatorPreventives]);

  const handleSelectAll = (
    selectAll: boolean,
    type: "available" | "assigned"
  ) => {
    if (type === "available") {
      setSelectedAvailable(
        selectAll ? new Set(preventives?.map((p) => p.id)) : new Set()
      );
    } else {
      setSelectedAssigned(
        selectAll
          ? new Set(operatorPreventivesAssigneds?.map((p) => p.id))
          : new Set()
      );
    }
  };

  const handleSelect = async (id: string, type: "available" | "assigned") => {
    if (type === "available") {
      setSelectedAvailable((prev) => {
        const newSet = new Set(prev); // Create a copy of the previous Set
        if (newSet.has(id)) {
          newSet.delete(id); // Remove the ID if it exists
        } else {
          newSet.add(id); // Add the ID if it doesn't exist
        }
        return newSet; // Return the updated Set
      });
    } else {
      setSelectedAssigned((prev) => {
        const newSet = new Set(prev); // Copy the previous Set
        if (newSet.has(id)) {
          newSet.delete(id); // Remove if it exists
        } else {
          newSet.add(id); // Add if it doesn't exist
        }
        return newSet; // Return the new Set
      });
    }
  };

  const assignOperatorToPreventives = async (id?: string) => {
    try {
      if (selectedAvailable.size === 0 && id == undefined) {
        alert("Has de seleccionar un preventiu per assignar-lo a l'operari");
        return;
      }

      const request: AssignOperatorToPreventivesRequest = {
        operatorId: operatorId,
        preventiveIds: Array.from(id == undefined ? selectedAvailable : [id]),
      };
      const result = await preventiveService.assignOperatorToPreventives(
        request
      );

      if (result) {
        const newlyAssignedPreventives = preventives!.filter((p) =>
          id != undefined ? p.id === id : selectedAvailable.has(p.id)
        );
        setOperatorPreventivesAssigneds((prevOperatorPreventives) => {
          const updatedPreventives = prevOperatorPreventives
            ? [...prevOperatorPreventives]
            : [];

          return [...updatedPreventives, ...newlyAssignedPreventives];
        });

        setSelectedAvailable(new Set());
        setSelectedAssigned(new Set());
      } else {
        setErrorMessage("Error assignant preventius");
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Error assigning operator to preventives:", error);
      setErrorMessage("Error assignant preventius");
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    }
  };

  const unAssignOperatorFromPreventives = async (id?: string) => {
    try {
      if (selectedAssigned.size === 0 && id == undefined) {
        alert("Has de seleccionar un preventiu assignat a l'operari");
        return;
      }

      const request: AssignOperatorToPreventivesRequest = {
        operatorId: operatorId,
        preventiveIds: Array.from(id == undefined ? selectedAssigned : [id]),
      };
      const result = await preventiveService.UnAssignOperatorFromPreventives(
        request
      );

      if (result) {
        const newlyUnassignedPreventives = operatorPreventivesAssigneds!.filter(
          (p) => (id != undefined ? p.id === id : selectedAssigned.has(p.id))
        );
        setOperatorPreventivesAssigneds((prevOperatorPreventives) => {
          if (!prevOperatorPreventives) return [];

          // Remove the newly unassigned preventives from the operatorPreventives
          const updatedPreventives = prevOperatorPreventives.filter(
            (p) => !newlyUnassignedPreventives.some((u) => u.id === p.id)
          );

          return updatedPreventives;
        });

        setSelectedAvailable(new Set());
        setSelectedAssigned(new Set());
      } else {
        setErrorMessage("Error desassignant preventius");
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Error unassigning operator from preventives:", error);
    }
  };

  const filteredPreventives = filterAvailable
    ? preventives?.filter((x) => !assignedPreventiveIds.has(x.id))
    : preventives;

  return (
    <div className="flex flex-col gap-4 mt-2">
      <div className="flex flex-row gap-4 mt-2">
        <PreventiveOperatorTable
          title="Preventius"
          preventives={filteredPreventives}
          assignedPreventiveIds={
            new Set(operatorPreventivesAssigneds?.map((p) => p.id) || [])
          }
          selected={selectedAvailable}
          onSelectAll={(selectAll) => handleSelectAll(selectAll, "available")}
          onSelect={(id) => handleSelect(id, "available")}
          onActionClick={assignOperatorToPreventives}
          actionLabel="Assignar"
          enableFilterPending={true}
        />
        <PreventiveOperatorTable
          title="Preventius assignats al operari"
          preventives={operatorPreventivesAssigneds}
          assignedPreventiveIds={null}
          selected={selectedAssigned}
          onSelectAll={(selectAll) => handleSelectAll(selectAll, "assigned")}
          onSelect={(id) => handleSelect(id, "assigned")}
          onActionClick={unAssignOperatorFromPreventives}
          actionLabel="Desasignar"
        />
      </div>
      {errorMessage !== null && (
        <div className="bg-red-200 text-red-800 p-4 rounded mb-4">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default PreventiveAssignment;
