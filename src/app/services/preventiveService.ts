import {
  AssignOperatorToPreventivesRequest,
  CreatePreventiveRequest,
  GetWOByPreventiveIdRequest,
  Preventive,
  UpdatePreventiveRequest,
} from "app/interfaces/Preventive";
import { WorkOrder } from "app/interfaces/workOrder";

class PreventiveService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getPreventives(): Promise<Preventive[]> {
    const response = await fetch(`${this.baseUrl}preventive`);
    if (!response.ok) {
      throw new Error("Failed to fetch inspection points");
    }
    return response.json();
  }

  async createPreventive(
    createPreventiveRequest: CreatePreventiveRequest | null
  ): Promise<boolean> {
    try {
      const url = `${this.baseUrl}preventive`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createPreventiveRequest),
      });
      if (!response.ok) {
        throw new Error(`Failed to create operator`);
      }
      return true;
    } catch (error) {
      console.error("Error creating operators:", error);
      throw error;
    }
  }

  async getPreventive(id: string | null): Promise<Preventive> {
    try {
      const url = `${this.baseUrl}preventive/${id}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get preventive`);
      }

      const responseBody = await response.json();
      return responseBody as Preventive;
    } catch (error) {
      console.error("Error getting preventive:", error);
      throw error;
    }
  }

  async updatePreventive(
    updatePreventiveRequest: UpdatePreventiveRequest
  ): Promise<boolean> {
    try {
      const url = `${this.baseUrl}preventive`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePreventiveRequest),
      });

      if (!response.ok) {
        throw new Error(`Failed to get preventive`);
      }
      return true;
    } catch (error) {
      console.error("Error getting preventive:", error);
      throw error;
    }
  }

  async deletePreventive(id: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}preventive/${id}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get preventive`);
      }

      return true;
    } catch (error) {
      console.error("Error getting preventive:", error);
      throw error;
    }
  }

  async CreateWorkOrderPreventivePerDay(
    userId: string,
    operatorId: string
  ): Promise<Preventive[] | null> {
    const response = await fetch(
      `${this.baseUrl}preventive/CreateWorkOrderPreventivePerDay?userId=${userId}&operatorId=${operatorId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch inspection points");
    }
    const responseBody = await response.json();
    return responseBody as Preventive[];
  }

  async getPreventiveByAssetId(id: string): Promise<Preventive[]> {
    try {
      const url = `${this.baseUrl}preventive/Asset/${id}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get preventive`);
      }

      const responseBody = await response.json();
      return responseBody as Preventive[];
    } catch (error) {
      console.error("Error getting preventive by asset id:", error);
      throw error;
    }
  }

  async ForceExecutePreventive(
    id: string,
    userId: string,
    operatorId: string
  ): Promise<Preventive> {
    try {
      const url = `${this.baseUrl}preventive/ForceExecutePreventive/${id}?userId=${userId}&operatorId=${operatorId}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get preventive`);
      }

      return response.json();
    } catch (error) {
      console.error("Error getting preventive:", error);
      throw error;
    }
  }

  async getWOByPreventiveId(
    request: GetWOByPreventiveIdRequest
  ): Promise<WorkOrder[]> {
    try {
      const url = `${this.baseUrl}preventive/GetWOByPreventiveId`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to get preventive`);
      }

      const responseBody = await response.json();
      return responseBody as WorkOrder[];
    } catch (error) {
      console.error("Error getting preventive by asset id:", error);
      throw error;
    }
  }

  async getPreventiveByOperatorId(operatorId: string): Promise<Preventive[]> {
    try {
      const url = `${this.baseUrl}preventive/GetPreventiveByOperatorId?operatorId=${operatorId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get preventives by operator ID`);
      }

      return (await response.json()) as Preventive[];
    } catch (error) {
      console.error("Error getting preventive by operator ID:", error);
      throw error;
    }
  }

  async assignOperatorToPreventives(
    request: AssignOperatorToPreventivesRequest
  ): Promise<boolean> {
    try {
      const url = `${this.baseUrl}preventive/AssignOperatorsToPreventive`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to assign operator to preventives`);
      }

      return true;
    } catch (error) {
      console.error("Error assigning operator to preventives:", error);
      throw error;
    }
  }

  async UnAssignOperatorFromPreventives(
    request: AssignOperatorToPreventivesRequest
  ): Promise<boolean> {
    try {
      const url = `${this.baseUrl}preventive/UnAssignOperatorFromPreventives`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to assign operator to preventives`);
      }

      return true;
    } catch (error) {
      console.error("Error assigning operator to preventives:", error);
      throw error;
    }
  }
}

export default PreventiveService;
