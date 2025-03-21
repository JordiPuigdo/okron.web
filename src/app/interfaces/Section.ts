import { BaseModel } from "./BaseModel";

interface Section extends BaseModel {
    id: string;
    code: string;
    description: string;
  }
  
  export default Section;
