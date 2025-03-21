import { CreateDocumentationRequest, DeleteDocumentationRequest } from "app/interfaces/Documentation";

class DocumentationService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }


    async createDocumentation(createDocumentation: CreateDocumentationRequest): Promise<string> { 
        try {
            const formData = new FormData();
            formData.append('userId', createDocumentation.userId);
            formData.append('fileName', createDocumentation.fileName);
            formData.append('file', createDocumentation.file);
            formData.append('objectId', createDocumentation.objectId);
            formData.append('object', createDocumentation.object.toString());
            const url = `${this.baseUrl}documentation`;
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                console.error('Failed to add asset');
                throw new Error('Failed to add asset');
            }

            return response.json();
        } catch (error) {
            console.error('Error adding asset:', error);
            throw error;
        }
    }

    async deleteDocumentation(createDocumentation: DeleteDocumentationRequest): Promise<boolean> { 
        try {  
            const { userId, fileName, fileId, objectId, object } = createDocumentation;
            const url = `${this.baseUrl}documentation`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    fileName,
                    fileId,
                    objectId,
                    object,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete documentation');
            }
            return true;
        } catch (error) {
            console.error('Error adding asset:', error);
            throw error;
        }
    }

}

export default DocumentationService;