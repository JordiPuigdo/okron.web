import Section from "./Section";
import WorkOrder from "./workOrder";

interface Machine {
    id: string;
    code : string;
    description: string;
    serialNumber: string;
    company: string;
    year: string;
    hours: string;
    workOrder : WorkOrder[];
    active : boolean;
    section : Section | null;
  }
  
  export default Machine;
