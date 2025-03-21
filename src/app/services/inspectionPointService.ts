import InspectionPoint from '../../app/interfaces/inspectionPoint'; // Import your InspectionPoint model

class InspectionPointService {
  private baseUrl: string; // Replace with your API base URL

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getAllInspectionPoints(): Promise<InspectionPoint[]> {
    const response = await fetch(`${this.baseUrl}inspectionpoints`);
    if (!response.ok) {
      throw new Error('Failed to fetch inspection points');
    }
    return response.json();
  }

  async getInspectionPointById(id: string): Promise<InspectionPoint | null> {
    const response = await fetch(`${this.baseUrl}inspectionpoints/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch inspection point with ID ${id}`);
    }
    return response.json();
  }

  async createInspectionPoint(inspectionPoint: InspectionPoint): Promise<void> {
    const response = await fetch(`${this.baseUrl}inspectionpoints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inspectionPoint),
    });
    if (!response.ok) {
      throw new Error('Failed to create inspection point');
    }
  }

  async updateInspectionPoint(id: string, inspectionPoint: InspectionPoint): Promise<void> {
    const response = await fetch(`${this.baseUrl}inspectionpoints/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inspectionPoint),
    });
    if (!response.ok) {
      throw new Error(`Failed to update inspection point with ID ${id}`);
    }
  }

  async deleteInspectionPoint(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}inspectionpoints/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete inspection point with ID ${id}`);
    }
  }
}

export default InspectionPointService;
