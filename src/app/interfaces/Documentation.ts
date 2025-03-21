
export interface Documentation {
    id: string;
    url: string;
    fileName: string;
}

export interface CreateDocumentationRequest {
    userId: string;
    fileName : string;
    file : File;
    objectId : string;
    object: ObjectToInsert;
}


export interface DeleteDocumentationRequest {
    userId: string;
    fileName : string;
    fileId : string; 
    objectId : string;
    object: ObjectToInsert;
}


export enum ObjectToInsert{
    None,
    SparePart,
    Asset,
    WorkOrder,
}