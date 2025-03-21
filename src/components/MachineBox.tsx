import React from "react";
import Machine from "app/interfaces/machine"; // Import the Machine type
import Link from "next/link";

const MachineBox = ({ machine }: { machine: Machine }) => {
  return (
    <div className="bg-white p-4 border rounded-lg shadow-m mx-4">
      <Link href={`/machineDetail/${machine.id}`}>
        <h2 className="text-xl font-semibold">{machine.description}</h2>
        <p className="text-gray-600">{machine.company}</p>
      </Link>
    </div>
  );
};

export default MachineBox;
